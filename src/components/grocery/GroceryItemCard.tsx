import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroceryItem } from '@/types';
import { MacroBar } from '@/components/ui/MacroBar';

interface GroceryItemCardProps {
  item: GroceryItem;
  onToggle: () => void;
  onDelete: () => void;
}

export function GroceryItemCard({ item, onToggle, onDelete }: GroceryItemCardProps) {
  return (
    <View style={[styles.card, item.checked && styles.cardChecked]}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
        <Ionicons
          name={item.checked ? 'checkbox' : 'square-outline'}
          size={24}
          color={item.checked ? '#4CAF50' : '#999'}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.name, item.checked && styles.nameChecked]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.quantity}>{item.quantity} {item.unit}</Text>
          <Text style={styles.addedBy}>by {item.addedByName}</Text>
          {item.fromRecipe && (
            <Text style={styles.fromRecipe}>from {item.fromRecipe}</Text>
          )}
        </View>
        {item.macros.calories > 0 && <MacroBar macros={item.macros} compact />}
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardChecked: { opacity: 0.6 },
  checkbox: { marginRight: 12 },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  nameChecked: { textDecorationLine: 'line-through', color: '#999' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  quantity: { fontSize: 13, color: '#666' },
  addedBy: { fontSize: 12, color: '#999' },
  fromRecipe: { fontSize: 12, color: '#4CAF50', fontStyle: 'italic' },
  deleteBtn: { padding: 8 },
});
