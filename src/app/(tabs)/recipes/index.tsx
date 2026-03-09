import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '@/stores/recipeStore';
import { usePantryStore } from '@/stores/pantryStore';
import { useAuthStore } from '@/stores/authStore';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { FilterChips } from '@/components/ui/FilterChips';
import { Button } from '@/components/ui/Button';
import { Recipe, CuisineFilter } from '@/types';

const cuisineOptions: { value: CuisineFilter; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'asian', label: 'Asian' },
  { value: 'american', label: 'American' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'indian', label: 'Indian' },
];

export default function RecipesScreen() {
  const user = useAuthStore((s) => s.user);
  const pantryItems = usePantryStore((s) => s.items);
  const {
    suggestions,
    setFavorites,
    cuisineFilter,
    setCuisineFilter,
    isGenerating,
    generate,
  } = useRecipeStore();

  const householdId = user?.householdId;
  useFirestoreSubscription<Recipe>(
    householdId ? `households/${householdId}/recipes` : null,
    setFavorites,
    !!householdId
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Button
          title={isGenerating ? 'Generating...' : 'Generate Recipes'}
          onPress={() => generate(pantryItems)}
          loading={isGenerating}
          style={styles.generateBtn}
        />
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => router.push('/(tabs)/recipes/favorites')}
        >
          <Ionicons name="heart" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <FilterChips options={cuisineOptions} selected={cuisineFilter} onSelect={setCuisineFilter} />

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => {
              // Store temp recipe for detail view
              router.push({ pathname: '/(tabs)/recipes/[id]', params: { id: item.id, isNew: 'true' } });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No recipes yet</Text>
            <Text style={styles.emptySubtext}>
              Add items to your pantry, then tap "Generate Recipes"
            </Text>
          </View>
        }
        contentContainerStyle={suggestions.length === 0 ? styles.emptyContainer : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  headerRow: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  generateBtn: { flex: 1 },
  favBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  list: { paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyContainer: { flex: 1 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#BBB', textAlign: 'center', paddingHorizontal: 40 },
});
