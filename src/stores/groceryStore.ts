import { create } from 'zustand';
import { GroceryItem, Macros, PantryUnit } from '@/types';
import { addDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { v4 as uuid } from 'uuid';

interface GroceryState {
  items: GroceryItem[];
  setItems: (items: GroceryItem[]) => void;
  addItem: (householdId: string, item: Omit<GroceryItem, 'id' | 'createdAt'>) => Promise<void>;
  toggleChecked: (householdId: string, item: GroceryItem) => Promise<void>;
  deleteItem: (householdId: string, id: string) => Promise<void>;
  clearChecked: (householdId: string) => Promise<void>;
  addFromRecipe: (
    householdId: string,
    ingredients: { name: string; amount: number; unit: string }[],
    recipeTitle: string,
    addedBy: string,
    addedByName: string
  ) => Promise<void>;
  getUnchecked: () => GroceryItem[];
  getChecked: () => GroceryItem[];
  clear: () => void;
}

export const useGroceryStore = create<GroceryState>()((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),

  addItem: async (householdId, itemData) => {
    const id = uuid();
    const item: GroceryItem = { ...itemData, id, createdAt: Date.now() };
    await addDocument(`households/${householdId}/groceryItems`, id, item);
  },

  toggleChecked: async (householdId, item) => {
    await updateDocument(`households/${householdId}/groceryItems`, item.id, {
      checked: !item.checked,
    });
  },

  deleteItem: async (householdId, id) => {
    await deleteDocument(`households/${householdId}/groceryItems`, id);
  },

  clearChecked: async (householdId) => {
    const checked = get().items.filter((i) => i.checked);
    await Promise.all(checked.map((i) => deleteDocument(`households/${householdId}/groceryItems`, i.id)));
  },

  addFromRecipe: async (householdId, ingredients, recipeTitle, addedBy, addedByName) => {
    await Promise.all(
      ingredients.map((ing) => {
        const id = uuid();
        const item: GroceryItem = {
          id,
          name: ing.name,
          quantity: ing.amount,
          unit: (ing.unit || 'count') as PantryUnit,
          macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          checked: false,
          addedBy,
          addedByName,
          fromRecipe: recipeTitle,
          createdAt: Date.now(),
        };
        return addDocument(`households/${householdId}/groceryItems`, id, item);
      })
    );
  },

  getUnchecked: () => get().items.filter((i) => !i.checked).sort((a, b) => b.createdAt - a.createdAt),
  getChecked: () => get().items.filter((i) => i.checked),
  clear: () => set({ items: [] }),
}));
