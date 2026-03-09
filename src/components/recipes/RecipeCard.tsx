import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '@/types';
import { MacroBar } from '@/components/ui/MacroBar';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const avgRating =
    Object.values(recipe.ratings).length > 0
      ? Object.values(recipe.ratings).reduce((a, b) => a + b, 0) / Object.values(recipe.ratings).length
      : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.cuisineBadge}>
          <Text style={styles.cuisineText}>{recipe.cuisine}</Text>
        </View>
        {avgRating !== null && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{recipe.prepTime + recipe.cookTime}m</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{recipe.servings} servings</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="restaurant-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{recipe.ingredients.length} ingredients</Text>
        </View>
      </View>
      <MacroBar macros={recipe.macros} compact />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cuisineBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cuisineText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#333' },
  title: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#888' },
});
