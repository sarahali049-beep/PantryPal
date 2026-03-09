import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGroceryStore } from '@/stores/groceryStore';
import { useAuthStore } from '@/stores/authStore';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { GroceryItemCard } from '@/components/grocery/GroceryItemCard';
import { FAB } from '@/components/ui/FAB';
import { MacroBar } from '@/components/ui/MacroBar';
import { GroceryItem } from '@/types';
import { sumMacros } from '@/utils/macros';

export default function GroceryScreen() {
  const user = useAuthStore((s) => s.user);
  const { setItems, getUnchecked, getChecked, toggleChecked, deleteItem, clearChecked } = useGroceryStore();
  const [showCompleted, setShowCompleted] = useState(false);

  const householdId = user?.householdId;
  useFirestoreSubscription<GroceryItem>(
    householdId ? `households/${householdId}/groceryItems` : null,
    setItems,
    !!householdId
  );

  const unchecked = getUnchecked();
  const checked = getChecked();
  const totalMacros = sumMacros(unchecked.map((i) => i.macros));

  const handleClearChecked = () => {
    if (!householdId || checked.length === 0) return;
    Alert.alert('Clear Completed', `Remove ${checked.length} checked items?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearChecked(householdId) },
    ]);
  };

  return (
    <View style={styles.container}>
      {unchecked.length > 0 && (
        <View style={styles.macroSummary}>
          <Text style={styles.macroLabel}>Grocery List Totals</Text>
          <MacroBar macros={totalMacros} />
        </View>
      )}

      <FlatList
        data={unchecked}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroceryItemCard
            item={item}
            onToggle={() => householdId && toggleChecked(householdId, item)}
            onDelete={() => householdId && deleteItem(householdId, item.id)}
          />
        )}
        ListFooterComponent={
          checked.length > 0 ? (
            <View>
              <TouchableOpacity
                style={styles.completedHeader}
                onPress={() => setShowCompleted(!showCompleted)}
              >
                <Text style={styles.completedTitle}>
                  Completed ({checked.length})
                </Text>
                <View style={styles.completedActions}>
                  <TouchableOpacity onPress={handleClearChecked} style={styles.clearBtn}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                  <Ionicons name={showCompleted ? 'chevron-up' : 'chevron-down'} size={20} color="#999" />
                </View>
              </TouchableOpacity>
              {showCompleted &&
                checked.map((item) => (
                  <GroceryItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => householdId && toggleChecked(householdId, item)}
                    onDelete={() => householdId && deleteItem(householdId, item.id)}
                  />
                ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Your grocery list is empty</Text>
            <Text style={styles.emptySubtext}>Tap + to add items</Text>
          </View>
        }
        contentContainerStyle={unchecked.length === 0 && checked.length === 0 ? styles.emptyContainer : styles.list}
      />
      <FAB onPress={() => router.push('/(tabs)/grocery/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  macroSummary: { backgroundColor: '#FFF', padding: 12, marginBottom: 4 },
  macroLabel: { fontSize: 13, fontWeight: '600', color: '#666', textAlign: 'center', marginBottom: 4 },
  list: { paddingTop: 8, paddingBottom: 80 },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  completedTitle: { fontSize: 15, fontWeight: '600', color: '#999' },
  completedActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clearBtn: { paddingHorizontal: 8 },
  clearText: { fontSize: 14, color: '#F44336', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyContainer: { flex: 1 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#BBB', marginTop: 4 },
});
