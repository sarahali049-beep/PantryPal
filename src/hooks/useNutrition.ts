import { useState, useCallback } from 'react';
import { searchFoods, extractMacros } from '@/services/nutrition';
import { USDASearchResult, Macros } from '@/types';
import { emptyMacros } from '@/utils/macros';

export function useNutrition() {
  const [results, setResults] = useState<USDASearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMacros, setSelectedMacros] = useState<Macros>(emptyMacros);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const foods = await searchFoods(query);
      setResults(foods);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const selectFood = useCallback((food: USDASearchResult) => {
    const macros = extractMacros(food);
    setSelectedMacros(macros);
    setResults([]);
    return macros;
  }, []);

  return { results, isSearching, selectedMacros, search, selectFood, setSelectedMacros };
}
