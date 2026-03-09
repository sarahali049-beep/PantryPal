import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { usePantryStore } from '@/stores/pantryStore';
import { useAuthStore } from '@/stores/authStore';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { PantryItemCard } from '@/components/pantry/PantryItemCard';
import { FilterChips } from '@/components/ui/FilterChips';
import { FAB } from '@/components/ui/FAB';
import { Input } from '@/components/ui/Input';
import { PantryItem, PantryFilter } from '@/types';

const filterOptions: { value: PantryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low', label: 'Low' },
  { value: 'out', label: 'Out' },
  { value: 'expiring', label: 'Expiring' },
];

export default function PantryScreen() {
  const user = useAuthStore((s) => s.user);
  const { setItems, filter, setFilter, searchQuery, setSearchQuery, getFilteredItems } = usePantryStore();

  const householdId = user?.householdId;
  useFirestoreSubscription<PantryItem>(
    householdId ? `households/${householdId}/pantryItems` : null,
    setItems,
    !!householdId
  );

  const items = getFilteredItems();

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search pantry..."
          style={styles.searchInput}
        />
      </View>
      <FilterChips options={filterOptions} selected={filter} onSelect={setFilter} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PantryItemCard
            item={item}
            onPress={() => router.push(`/(tabs)/pantry/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first pantry item</Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
      />
      <FAB onPress={() => router.push('/(tabs)/pantry/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 8 },
  searchInput: { marginBottom: 0 },
  list: { paddingTop: 8, paddingBottom: 80 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyContainer: { flex: 1 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#BBB', marginTop: 4 },
});
