import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePantryStore } from '@/stores/pantryStore';
import { useGroceryStore } from '@/stores/groceryStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { MacroBar } from '@/components/ui/MacroBar';
import { sumMacros, emptyMacros } from '@/utils/macros';
import { getExpiryLevel } from '@/utils/dates';

export default function StatsScreen() {
  const pantryItems = usePantryStore((s) => s.items);
  const groceryItems = useGroceryStore((s) => s.items);
  const favorites = useRecipeStore((s) => s.favorites);
  const household = useHouseholdStore((s) => s.household);

  const inStock = pantryItems.filter((i) => i.status === 'in_stock').length;
  const low = pantryItems.filter((i) => i.status === 'low').length;
  const outOf = pantryItems.filter((i) => i.status === 'out').length;
  const expiringSoon = pantryItems.filter((i) => {
    const level = getExpiryLevel(i.expiryDate);
    return level === 'soon' || level === 'urgent';
  }).length;
  const expired = pantryItems.filter((i) => getExpiryLevel(i.expiryDate) === 'expired').length;

  const pantryMacros = sumMacros(pantryItems.map((i) => i.macros));
  const groceryUnchecked = groceryItems.filter((i) => !i.checked).length;

  // Most common categories
  const categoryCounts: Record<string, number> = {};
  pantryItems.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      {/* Household info */}
      {household && (
        <View style={styles.householdCard}>
          <Text style={styles.householdName}>{household.name}</Text>
          <Text style={styles.inviteCode}>Invite Code: {household.inviteCode}</Text>
          <Text style={styles.members}>
            {Object.values(household.members).map((m) => m.displayName).join(' & ')}
          </Text>
        </View>
      )}

      {/* Quick stats */}
      <View style={styles.statsGrid}>
        <StatCard icon="nutrition-outline" color="#4CAF50" label="In Stock" value={inStock} />
        <StatCard icon="warning-outline" color="#FFC107" label="Low" value={low} />
        <StatCard icon="close-circle-outline" color="#F44336" label="Out" value={outOf} />
        <StatCard icon="time-outline" color="#FF5722" label="Expiring" value={expiringSoon} />
        <StatCard icon="cart-outline" color="#2196F3" label="To Buy" value={groceryUnchecked} />
        <StatCard icon="heart-outline" color="#E91E63" label="Recipes" value={favorites.length} />
      </View>

      {/* Expired items alert */}
      {expired > 0 && (
        <View style={styles.alertCard}>
          <Ionicons name="alert-circle" size={20} color="#F44336" />
          <Text style={styles.alertText}>{expired} expired item{expired !== 1 ? 's' : ''} in pantry!</Text>
        </View>
      )}

      {/* Pantry macro totals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pantry Nutrition Total</Text>
        <MacroBar macros={pantryMacros} />
      </View>

      {/* Top categories */}
      {topCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {topCategories.map(([cat, count]) => (
            <View key={cat} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{cat}</Text>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryFill,
                    { width: `${(count / pantryItems.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

function StatCard({ icon, color, label, value }: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  householdCard: {
    backgroundColor: '#4CAF50',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  householdName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  inviteCode: { fontSize: 14, color: '#C8E6C9', marginTop: 4 },
  members: { fontSize: 15, color: '#FFF', marginTop: 8, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#333', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    margin: 16,
    borderRadius: 12,
    padding: 12,
  },
  alertText: { fontSize: 14, color: '#F44336', fontWeight: '600' },
  section: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryName: { width: 80, fontSize: 13, color: '#666', textTransform: 'capitalize' },
  categoryBar: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, marginHorizontal: 8 },
  categoryFill: { height: 8, backgroundColor: '#4CAF50', borderRadius: 4 },
  categoryCount: { width: 30, fontSize: 13, color: '#888', textAlign: 'right' },
  spacer: { height: 20 },
});
