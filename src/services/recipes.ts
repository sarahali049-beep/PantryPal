import { PantryItem, Recipe, CuisineFilter, Macros } from '@/types';
import { emptyMacros } from '@/utils/macros';
import { v4 as uuid } from 'uuid';

const CLAUDE_API_KEY = 'YOUR_CLAUDE_API_KEY'; // Replace with your key
const SPOONACULAR_API_KEY = 'YOUR_SPOONACULAR_KEY'; // Fallback

interface GenerateOptions {
  pantryItems: PantryItem[];
  cuisine: CuisineFilter;
  servings: number;
  maxCalories?: number;
}

function buildClaudePrompt(opts: GenerateOptions): string {
  const ingredients = opts.pantryItems
    .filter((i) => i.status !== 'out')
    .map((i) => `${i.name} (${i.quantity} ${i.unit})`)
    .join(', ');

  return `You are a helpful cooking assistant. Based on these available ingredients: ${ingredients}

Generate 3 recipe suggestions${opts.cuisine !== 'any' ? ` with ${opts.cuisine} cuisine` : ''} for ${opts.servings} servings${opts.maxCalories ? `, each under ${opts.maxCalories} calories per serving` : ''}.

Return ONLY a JSON array with this exact structure (no markdown, no explanation):
[
  {
    "title": "Recipe Name",
    "cuisine": "Italian",
    "servings": ${opts.servings},
    "prepTime": 15,
    "cookTime": 30,
    "ingredients": [
      {"name": "ingredient", "amount": 1, "unit": "cup"}
    ],
    "instructions": ["Step 1", "Step 2"],
    "macros": {"calories": 400, "protein": 30, "carbs": 40, "fat": 15}
  }
]`;
}

async function fetchFromClaude(opts: GenerateOptions): Promise<Recipe[]> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: buildClaudePrompt(opts) },
      ],
    }),
  });

  if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
  const data = await resp.json();
  const text = data.content[0]?.text || '';
  return parseRecipeJSON(text);
}

async function fetchFromSpoonacular(opts: GenerateOptions): Promise<Recipe[]> {
  const ingredients = opts.pantryItems
    .filter((i) => i.status !== 'out')
    .map((i) => i.name)
    .join(',');

  const resp = await fetch(
    `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(ingredients)}&number=3&ranking=1`
  );

  if (!resp.ok) throw new Error(`Spoonacular error: ${resp.status}`);
  const data = await resp.json();

  return data.map((item: any) => ({
    id: uuid(),
    title: item.title,
    cuisine: 'various',
    servings: opts.servings,
    prepTime: 15,
    cookTime: 30,
    ingredients: (item.usedIngredients || []).concat(item.missedIngredients || []).map((ing: any) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
    })),
    instructions: ['See full recipe on Spoonacular'],
    macros: emptyMacros,
    ratings: {},
    notes: [],
    addedBy: '',
    addedByName: '',
    createdAt: Date.now(),
  }));
}

function parseRecipeJSON(text: string): Recipe[] {
  // Try to extract JSON array from text
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in response');

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.map((r: any) => ({
    id: uuid(),
    title: r.title || 'Untitled',
    cuisine: r.cuisine || 'various',
    servings: r.servings || 2,
    prepTime: r.prepTime || 15,
    cookTime: r.cookTime || 30,
    ingredients: (r.ingredients || []).map((ing: any) => ({
      name: ing.name,
      amount: ing.amount || 0,
      unit: ing.unit || '',
    })),
    instructions: r.instructions || [],
    macros: {
      calories: r.macros?.calories || 0,
      protein: r.macros?.protein || 0,
      carbs: r.macros?.carbs || 0,
      fat: r.macros?.fat || 0,
    },
    ratings: {},
    notes: [],
    addedBy: '',
    addedByName: '',
    createdAt: Date.now(),
  }));
}

export async function generateRecipes(opts: GenerateOptions): Promise<Recipe[]> {
  try {
    return await fetchFromClaude(opts);
  } catch (err) {
    console.warn('Claude API failed, falling back to Spoonacular:', err);
    try {
      return await fetchFromSpoonacular(opts);
    } catch (err2) {
      console.error('Both recipe APIs failed:', err2);
      return [];
    }
  }
}

export function matchIngredientsWithPantry(
  recipeIngredients: { name: string; amount: number; unit: string }[],
  pantryItems: PantryItem[]
): { name: string; amount: number; unit: string; inPantry: boolean }[] {
  const pantryNames = new Set(pantryItems.filter(p => p.status !== 'out').map((p) => p.name.toLowerCase()));
  return recipeIngredients.map((ing) => ({
    ...ing,
    inPantry: pantryNames.has(ing.name.toLowerCase()),
  }));
}
