import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '@/stores/recipeStore';
import { usePantryStore } from '@/stores/pantryStore';
import { useGroceryStore } from '@/stores/groceryStore';
import { useAuthStore } from '@/stores/authStore';
import { matchIngredientsWithPantry } from '@/services/recipes';
import { IngredientMatch } from '@/components/recipes/IngredientMatch';
import { MacroSummary } from '@/components/recipes/MacroSummary';
import { Button } from '@/components/ui/Button';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { suggestions, favorites, saveFavorite, rateRecipe, addNote } = useRecipeStore();
  const pantryItems = usePantryStore((s) => s.items);
  const addFromRecipe = useGroceryStore((s) => s.addFromRecipe);
  const [noteText, setNoteText] = useState('');
  const [userRating, setUserRating] = useState(0);

  const recipe = [...suggestions, ...favorites].find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Recipe not found</Text>
      </View>
    );
  }

  const matched = matchIngredientsWithPantry(recipe.ingredients, pantryItems);
  const missing = matched.filter((i) => !i.inPantry);
  const isFavorite = favorites.some((f) => f.id === recipe.id);

  const handleSave = async () => {
    if (!user?.householdId) return;
    await saveFavorite(user.householdId, recipe, user.uid, user.displayName);
    Alert.alert('Saved!', 'Recipe added to favorites');
  };

  const handleAddMissing = async () => {
    if (!user?.householdId || missing.length === 0) return;
    await addFromRecipe(user.householdId, missing, recipe.title, user.uid, user.displayName);
    Alert.alert('Added!', `${missing.length} items added to grocery list`);
  };

  const handleRate = async (rating: number) => {
    if (!user?.householdId) return;
    setUserRating(rating);
    await rateRecipe(user.householdId, recipe.id, user.uid, rating);
  };

  const handleAddNote = async () => {
    if (!user?.householdId || !noteText.trim()) return;
    await addNote(user.householdId, recipe.id, `${user.displayName}: ${noteText.trim()}`);
    setNoteText('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.cuisine}>{recipe.cuisine}</Text>
        <Text style={styles.meta}>{recipe.prepTime + recipe.cookTime} min</Text>
        <Text style={styles.meta}>{recipe.servings} servings</Text>
      </View>

      <MacroSummary macros={recipe.macros} />

      {/* Rating */}
      {isFavorite && (
        <View style={styles.ratingRow}>
          <Text style={styles.sectionTitle}>Your Rating</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => handleRate(n)}>
                <Ionicons
                  name={n <= (userRating || recipe.ratings[user?.uid || ''] || 0) ? 'star' : 'star-outline'}
                  size={28}
                  color="#FFC107"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Ingredients */}
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {matched.map((ing, i) => (
        <IngredientMatch key={i} ingredient={ing} />
      ))}

      {missing.length > 0 && (
        <Button
          title={`Add ${missing.length} Missing to Grocery List`}
          onPress={handleAddMissing}
          style={styles.addMissingBtn}
        />
      )}

      {/* Instructions */}
      <Text style={styles.sectionTitle}>Instructions</Text>
      {recipe.instructions.map((step, i) => (
        <View key={i} style={styles.step}>
          <Text style={styles.stepNum}>{i + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      {/* Notes */}
      {isFavorite && (
        <>
          <Text style={styles.sectionTitle}>Notes</Text>
          {recipe.notes.map((note, i) => (
            <Text key={i} style={styles.note}>{note}</Text>
          ))}
          <View style={styles.noteInput}>
            <TextInput
              style={styles.noteField}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a note..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleAddNote}>
              <Ionicons name="send" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {!isFavorite && (
        <Button title="Save to Favorites" onPress={handleSave} style={styles.saveBtn} />
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cuisine: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },
  meta: { fontSize: 14, color: '#888' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 20, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stars: { flexDirection: 'row', gap: 4 },
  addMissingBtn: { marginTop: 12 },
  step: { flexDirection: 'row', marginBottom: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    marginRight: 12,
    fontSize: 14,
  },
  stepText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },
  note: { fontSize: 14, color: '#666', paddingVertical: 4, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#E0E0E0', marginBottom: 4 },
  noteInput: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  noteField: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, color: '#333' },
  saveBtn: { marginTop: 20 },
  spacer: { height: 40 },
  notFound: { fontSize: 18, color: '#999', textAlign: 'center', marginTop: 60 },
});
