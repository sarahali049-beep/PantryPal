import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MacroBar } from '@/components/ui/MacroBar';
import { useNutrition } from '@/hooks/useNutrition';
import { PantryUnit, Macros, USDASearchResult } from '@/types';
import { emptyMacros } from '@/utils/macros';

interface GroceryItemFormProps {
  onSubmit: (values: {
    name: string;
    quantity: number;
    unit: PantryUnit;
    macros: Macros;
  }) => void;
  loading?: boolean;
}

const units: { value: PantryUnit; label: string }[] = [
  { value: 'count', label: 'Count' },
  { value: 'oz', label: 'oz' },
  { value: 'lb', label: 'lb' },
  { value: 'g', label: 'g' },
  { value: 'cup', label: 'Cup' },
];

export function GroceryItemForm({ onSubmit, loading }: GroceryItemFormProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<PantryUnit>('count');
  const [macros, setMacros] = useState<Macros>(emptyMacros);
  const { results, search, selectFood } = useNutrition();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (name.length >= 3) search(name);
    }, 500);
    return () => clearTimeout(timer);
  }, [name]);

  const handleSelectFood = (food: USDASearchResult) => {
    setName(food.description);
    const m = selectFood(food);
    setMacros(m);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Input label="Item Name" value={name} onChangeText={setName} placeholder="Search food..." />

      {results.length > 0 && (
        <View style={styles.suggestions}>
          {results.slice(0, 5).map((food) => (
            <TouchableOpacity
              key={food.fdcId}
              style={styles.suggestionItem}
              onPress={() => handleSelectFood(food)}
            >
              <Text style={styles.suggestionText} numberOfLines={1}>{food.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.chipRow}>
            {units.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[styles.chip, unit === u.value && styles.chipActive]}
                onPress={() => setUnit(u.value)}
              >
                <Text style={[styles.chipText, unit === u.value && styles.chipTextActive]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {macros.calories > 0 && (
        <>
          <Text style={styles.label}>Nutrition</Text>
          <MacroBar macros={macros} />
        </>
      )}

      <Button
        title="Add to List"
        onPress={() => {
          if (!name.trim()) return;
          onSubmit({ name: name.trim(), quantity: parseFloat(quantity) || 1, unit, macros });
        }}
        loading={loading}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
  },
  chipActive: { backgroundColor: '#4CAF50' },
  chipText: { fontSize: 12, color: '#666' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  suggestions: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: -8,
    marginBottom: 12,
  },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  suggestionText: { fontSize: 14, color: '#333' },
  submitBtn: { marginTop: 16, marginBottom: 40 },
});
