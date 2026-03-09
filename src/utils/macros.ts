import { Macros } from '@/types';

export const emptyMacros: Macros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export function sumMacros(items: Macros[]): Macros {
  return items.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { ...emptyMacros }
  );
}

export function scaleMacros(macros: Macros, factor: number): Macros {
  return {
    calories: Math.round(macros.calories * factor),
    protein: Math.round(macros.protein * factor * 10) / 10,
    carbs: Math.round(macros.carbs * factor * 10) / 10,
    fat: Math.round(macros.fat * factor * 10) / 10,
  };
}

export function formatMacros(macros: Macros): string {
  return `${macros.calories} cal | ${macros.protein}g P | ${macros.carbs}g C | ${macros.fat}g F`;
}
