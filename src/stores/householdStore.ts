import { create } from 'zustand';
import { Household } from '@/types';

interface HouseholdState {
  household: Household | null;
  setHousehold: (household: Household | null) => void;
  clear: () => void;
}

export const useHouseholdStore = create<HouseholdState>()((set) => ({
  household: null,
  setHousehold: (household) => set({ household }),
  clear: () => set({ household: null }),
}));
