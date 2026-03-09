import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '@/stores/recipeStore';
import { RecipeCard } from '@/components/recipes/RecipeCard';

export default function FavoritesScreen() {
  const favorites = useRecipeStore((s) => s.favorites);

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => router.push({ pathname: '/(tabs)/recipes/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Generate recipes and save your favorites here</Text>
          </View>
        }
        contentContainerStyle={favorites.length === 0 ? styles.emptyContainer : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  list: { paddingTop: 8, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyContainer: { flex: 1 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#BBB', textAlign: 'center', paddingHorizontal: 40 },
});
