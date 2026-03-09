import { create } from 'zustand';
import { MealPlanWeek, MealPlanDay, MealSlot, Recipe, Macros } from '@/types';
import { addDocument, updateDocument } from '@/services/firestore';
import { getCurrentWeekId } from '@/utils/dates';
import { sumMacros, emptyMacros } from '@/utils/macros';

const emptyDay: MealPlanDay = { breakfast: null, lunch: null, dinner: null, snack: null };
const defaultDays = (): Record<string, MealPlanDay> => ({
  monday: { ...emptyDay },
  tuesday: { ...emptyDay },
  wednesday: { ...emptyDay },
  thursday: { ...emptyDay },
  friday: { ...emptyDay },
  saturday: { ...emptyDay },
  sunday: { ...emptyDay },
});

interface PlannerState {
  weekPlan: MealPlanWeek | null;
  currentWeekId: string;
  setWeekPlan: (plan: MealPlanWeek | null) => void;
  setCurrentWeekId: (weekId: string) => void;
  assignRecipe: (householdId: string, day: string, slot: MealSlot, recipeId: string | null) => Promise<void>;
  getDayMacros: (day: string, recipes: Recipe[]) => Macros;
  getWeekMacros: (recipes: Recipe[]) => Macros;
  clear: () => void;
}

export const usePlannerStore = create<PlannerState>()((set, get) => ({
  weekPlan: null,
  currentWeekId: getCurrentWeekId(),
  setWeekPlan: (weekPlan) => set({ weekPlan }),
  setCurrentWeekId: (currentWeekId) => set({ currentWeekId }),

  assignRecipe: async (householdId, day, slot, recipeId) => {
    const { weekPlan, currentWeekId } = get();
    const days = weekPlan?.days || defaultDays();
    const updatedDays = {
      ...days,
      [day]: { ...days[day], [slot]: recipeId },
    };

    const plan: MealPlanWeek = {
      id: currentWeekId,
      days: updatedDays,
    };

    await addDocument(`households/${householdId}/mealPlan`, currentWeekId, plan);
    set({ weekPlan: plan });
  },

  getDayMacros: (day, recipes) => {
    const { weekPlan } = get();
    if (!weekPlan?.days[day]) return emptyMacros;
    const dayPlan = weekPlan.days[day];
    const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    const macrosList = slots
      .map((slot) => {
        const recipeId = dayPlan[slot];
        if (!recipeId) return null;
        const recipe = recipes.find((r) => r.id === recipeId);
        return recipe?.macros || null;
      })
      .filter(Boolean) as Macros[];
    return sumMacros(macrosList);
  },

  getWeekMacros: (recipes) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayMacros = days.map((d) => get().getDayMacros(d, recipes));
    return sumMacros(dayMacros);
  },

  clear: () => set({ weekPlan: null, currentWeekId: getCurrentWeekId() }),
}));
