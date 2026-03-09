import { Macros, USDASearchResult } from '@/types';
import { emptyMacros } from '@/utils/macros';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'DEMO_KEY'; // Replace with your USDA FoodData Central API key

// Nutrient IDs: 1008=Energy(kcal), 1003=Protein, 1005=Carbs, 1004=Fat
const NUTRIENT_MAP: Record<number, keyof Macros> = {
  1008: 'calories',
  1003: 'protein',
  1005: 'carbs',
  1004: 'fat',
};

export async function searchFoods(query: string): Promise<USDASearchResult[]> {
  if (!query.trim()) return [];

  const resp = await fetch(`${USDA_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=10&dataType=Foundation,SR%20Legacy`);
  if (!resp.ok) return [];

  const data = await resp.json();
  return (data.foods || []) as USDASearchResult[];
}

export function extractMacros(food: USDASearchResult): Macros {
  const macros = { ...emptyMacros };
  for (const nutrient of food.foodNutrients) {
    const key = NUTRIENT_MAP[nutrient.nutrientId];
    if (key) {
      macros[key] = Math.round(nutrient.value * 10) / 10;
    }
  }
  return macros;
}

export async function lookupFoodMacros(query: string): Promise<Macros> {
  const results = await searchFoods(query);
  if (results.length === 0) return emptyMacros;
  return extractMacros(results[0]);
}
