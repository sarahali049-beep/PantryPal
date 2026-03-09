import { create } from 'zustand';
import { Recipe, CuisineFilter, PantryItem } from '@/types';
import { generateRecipes, matchIngredientsWithPantry } from '@/services/recipes';
import { addDocument, updateDocument, deleteDocument } from '@/services/firestore';

interface RecipeState {
  suggestions: Recipe[];
  favorites: Recipe[];
  cuisineFilter: CuisineFilter;
  isGenerating: boolean;
  setSuggestions: (recipes: Recipe[]) => void;
  setFavorites: (recipes: Recipe[]) => void;
  setCuisineFilter: (filter: CuisineFilter) => void;
  generate: (pantryItems: PantryItem[], servings?: number) => Promise<void>;
  saveFavorite: (householdId: string, recipe: Recipe, addedBy: string, addedByName: string) => Promise<void>;
  rateRecipe: (householdId: string, recipeId: string, uid: string, rating: number) => Promise<void>;
  addNote: (householdId: string, recipeId: string, note: string) => Promise<void>;
  deleteFavorite: (householdId: string, recipeId: string) => Promise<void>;
  clear: () => void;
}

export const useRecipeStore = create<RecipeState>()((set, get) => ({
  suggestions: [],
  favorites: [],
  cuisineFilter: 'any',
  isGenerating: false,
  setSuggestions: (suggestions) => set({ suggestions }),
  setFavorites: (favorites) => set({ favorites }),
  setCuisineFilter: (cuisineFilter) => set({ cuisineFilter }),

  generate: async (pantryItems, servings = 2) => {
    set({ isGenerating: true });
    try {
      const recipes = await generateRecipes({
        pantryItems,
        cuisine: get().cuisineFilter,
        servings,
      });
      set({ suggestions: recipes });
    } finally {
      set({ isGenerating: false });
    }
  },

  saveFavorite: async (householdId, recipe, addedBy, addedByName) => {
    const fav = { ...recipe, addedBy, addedByName };
    await addDocument(`households/${householdId}/recipes`, recipe.id, fav);
  },

  rateRecipe: async (householdId, recipeId, uid, rating) => {
    const recipe = get().favorites.find((r) => r.id === recipeId);
    if (!recipe) return;
    const ratings = { ...recipe.ratings, [uid]: rating };
    await updateDocument(`households/${householdId}/recipes`, recipeId, { ratings });
  },

  addNote: async (householdId, recipeId, note) => {
    const recipe = get().favorites.find((r) => r.id === recipeId);
    if (!recipe) return;
    const notes = [...recipe.notes, note];
    await updateDocument(`households/${householdId}/recipes`, recipeId, { notes });
  },

  deleteFavorite: async (householdId, recipeId) => {
    await deleteDocument(`households/${householdId}/recipes`, recipeId);
  },

  clear: () => set({ suggestions: [], favorites: [], cuisineFilter: 'any', isGenerating: false }),
}));
