import { create } from 'zustand';
import { PantryItem, PantryFilter, Macros, PantryCategory, PantryUnit, PantryStatus } from '@/types';
import { addDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { v4 as uuid } from 'uuid';

interface PantryState {
  items: PantryItem[];
  filter: PantryFilter;
  searchQuery: string;
  setItems: (items: PantryItem[]) => void;
  setFilter: (filter: PantryFilter) => void;
  setSearchQuery: (query: string) => void;
  addItem: (householdId: string, item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (householdId: string, id: string, data: Partial<PantryItem>) => Promise<void>;
  deleteItem: (householdId: string, id: string) => Promise<void>;
  getFilteredItems: () => PantryItem[];
  clear: () => void;
}

export const usePantryStore = create<PantryState>()((set, get) => ({
  items: [],
  filter: 'all',
  searchQuery: '',
  setItems: (items) => set({ items }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  addItem: async (householdId, itemData) => {
    const id = uuid();
    const now = Date.now();
    const item: PantryItem = {
      ...itemData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await addDocument(`households/${householdId}/pantryItems`, id, item);
  },

  updateItem: async (householdId, id, data) => {
    await updateDocument(`households/${householdId}/pantryItems`, id, {
      ...data,
      updatedAt: Date.now(),
    });
  },

  deleteItem: async (householdId, id) => {
    await deleteDocument(`households/${householdId}/pantryItems`, id);
  },

  getFilteredItems: () => {
    const { items, filter, searchQuery } = get();
    let filtered = items;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(q));
    }

    switch (filter) {
      case 'in_stock':
        return filtered.filter((i) => i.status === 'in_stock');
      case 'low':
        return filtered.filter((i) => i.status === 'low');
      case 'out':
        return filtered.filter((i) => i.status === 'out');
      case 'expiring':
        return filtered.filter((i) => {
          if (!i.expiryDate) return false;
          const days = Math.ceil(
            (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          return days <= 5 && days >= 0;
        });
      default:
        return filtered;
    }
  },

  clear: () => set({ items: [], filter: 'all', searchQuery: '' }),
}));
