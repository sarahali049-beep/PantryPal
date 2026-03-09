import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PantryItem } from '@/types';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { MacroBar } from '@/components/ui/MacroBar';

interface PantryItemCardProps {
  item: PantryItem;
  onPress: () => void;
}

const statusColors: Record<string, string> = {
  in_stock: '#4CAF50',
  low: '#FFC107',
  out: '#F44336',
};

const statusLabels: Record<string, string> = {
  in_stock: 'In Stock',
  low: 'Low',
  out: 'Out',
};

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  produce: 'leaf-outline',
  dairy: 'water-outline',
  meat: 'restaurant-outline',
  grains: 'nutrition-outline',
  canned: 'cube-outline',
  frozen: 'snow-outline',
  snacks: 'pizza-outline',
  beverages: 'cafe-outline',
  condiments: 'color-fill-outline',
  spices: 'flame-outline',
  other: 'ellipse-outline',
};

export function PantryItemCard({ item, onPress }: PantryItemCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={categoryIcons[item.category] || 'ellipse-outline'}
          size={24}
          color="#4CAF50"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <ExpiryBadge expiryDate={item.expiryDate} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.quantity}>{item.quantity} {item.unit}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
              {statusLabels[item.status]}
            </Text>
          </View>
        </View>
        <MacroBar macros={item.macros} compact />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 },
  quantity: { fontSize: 13, color: '#666', marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
