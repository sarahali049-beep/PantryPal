// ─── User & Household ───

export interface User {
  uid: string;
  email: string;
  displayName: string;
  householdId: string | null;
}

export interface HouseholdMember {
  uid: string;
  displayName: string;
  email: string;
}

export interface Household {
  id: string;
  name: string;
  memberIds: string[];
  members: Record<string, HouseholdMember>;
  inviteCode: string;
  createdAt: number;
}

// ─── Macros ───

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ─── Pantry ───

export type PantryCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'grains'
  | 'canned'
  | 'frozen'
  | 'snacks'
  | 'beverages'
  | 'condiments'
  | 'spices'
  | 'other';

export type PantryStatus = 'in_stock' | 'low' | 'out';

export type PantryUnit = 'oz' | 'lb' | 'g' | 'kg' | 'cup' | 'tbsp' | 'tsp' | 'ml' | 'l' | 'count' | 'other';

export interface PantryItem {
  id: string;
  name: string;
  category: PantryCategory;
  quantity: number;
  unit: PantryUnit;
  status: PantryStatus;
  macros: Macros;
  expiryDate: string | null; // ISO date string
  addedBy: string; // uid
  addedByName: string;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  createdAt: number;
  updatedAt: number;
}

// ─── Grocery ───

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: PantryUnit;
  macros: Macros;
  checked: boolean;
  addedBy: string;
  addedByName: string;
  fromRecipe: string | null; // recipe title
  createdAt: number;
}

// ─── Recipes ───

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  inPantry?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  servings: number;
  prepTime: number; // minutes
  cookTime: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  macros: Macros; // per serving
  ratings: Record<string, number>; // uid → 1-5
  notes: string[];
  addedBy: string;
  addedByName: string;
  createdAt: number;
}

// ─── Meal Planning ───

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlanDay {
  breakfast: string | null; // recipe id
  lunch: string | null;
  dinner: string | null;
  snack: string | null;
}

export interface MealPlanWeek {
  id: string; // weekId like "2026-W10"
  days: Record<string, MealPlanDay>; // "monday" | "tuesday" etc.
}

// ─── USDA Nutrition API ───

export interface USDASearchResult {
  fdcId: number;
  description: string;
  brandName?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

// ─── Filters ───

export type PantryFilter = 'all' | 'in_stock' | 'low' | 'out' | 'expiring';

export type CuisineFilter = 'any' | 'italian' | 'mexican' | 'asian' | 'american' | 'mediterranean' | 'indian';
