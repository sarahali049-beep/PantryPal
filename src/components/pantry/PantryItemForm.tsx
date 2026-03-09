import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MacroBar } from '@/components/ui/MacroBar';
import { useNutrition } from '@/hooks/useNutrition';
import {
  PantryCategory,
  PantryUnit,
  PantryStatus,
  Macros,
  USDASearchResult,
} from '@/types';
import { emptyMacros } from '@/utils/macros';

interface PantryItemFormProps {
  initialValues?: {
    name: string;
    category: PantryCategory;
    quantity: string;
    unit: PantryUnit;
    status: PantryStatus;
    expiryDate: string;
    macros: Macros;
  };
  onSubmit: (values: {
    name: string;
    category: PantryCategory;
    quantity: number;
    unit: PantryUnit;
    status: PantryStatus;
    expiryDate: string | null;
    macros: Macros;
  }) => void;
  loading?: boolean;
  submitLabel?: string;
}

const categories: { value: PantryCategory; label: string }[] = [
  { value: 'produce', label: 'Produce' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'grains', label: 'Grains' },
  { value: 'canned', label: 'Canned' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'spices', label: 'Spices' },
  { value: 'other', label: 'Other' },
];

const units: { value: PantryUnit; label: string }[] = [
  { value: 'count', label: 'Count' },
  { value: 'oz', label: 'oz' },
  { value: 'lb', label: 'lb' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'cup', label: 'Cup' },
  { value: 'tbsp', label: 'Tbsp' },
  { value: 'tsp', label: 'Tsp' },
  { value: 'ml', label: 'mL' },
  { value: 'l', label: 'L' },
];

const statuses: { value: PantryStatus; label: string }[] = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low', label: 'Low' },
  { value: 'out', label: 'Out' },
];

export function PantryItemForm({ initialValues, onSubmit, loading, submitLabel = 'Add Item' }: PantryItemFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [category, setCategory] = useState<PantryCategory>(initialValues?.category || 'other');
  const [quantity, setQuantity] = useState(initialValues?.quantity || '1');
  const [unit, setUnit] = useState<PantryUnit>(initialValues?.unit || 'count');
  const [status, setStatus] = useState<PantryStatus>(initialValues?.status || 'in_stock');
  const [expiryDate, setExpiryDate] = useState(initialValues?.expiryDate || '');
  const [macros, setMacros] = useState<Macros>(initialValues?.macros || emptyMacros);

  const { results, isSearching, search, selectFood } = useNutrition();

  // Debounced USDA search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (name.length >= 3) search(name);
    }, 500);
    return () => clearTimeout(timer);
  }, [name]);

  const handleSelectFood = (food: USDASearchResult) => {
    setName(food.description);
    const foodMacros = selectFood(food);
    setMacros(foodMacros);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category,
      quantity: parseFloat(quantity) || 1,
      unit,
      status,
      expiryDate: expiryDate || null,
      macros,
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Input label="Item Name" value={name} onChangeText={setName} placeholder="Search or enter item name..." />

      {results.length > 0 && (
        <View style={styles.suggestions}>
          {results.slice(0, 5).map((food) => (
            <TouchableOpacity
              key={food.fdcId}
              style={styles.suggestionItem}
              onPress={() => handleSelectFood(food)}
            >
              <Text style={styles.suggestionText} numberOfLines={1}>
                {food.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.sectionLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.chip, category === c.value && styles.chipActive]}
            onPress={() => setCategory(c.value)}
          >
            <Text style={[styles.chipText, category === c.value && styles.chipTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.half}>
          <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
        </View>
        <View style={styles.half}>
          <Text style={styles.sectionLabel}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {units.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[styles.miniChip, unit === u.value && styles.chipActive]}
                onPress={() => setUnit(u.value)}
              >
                <Text style={[styles.chipText, unit === u.value && styles.chipTextActive]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Status</Text>
      <View style={styles.chipRow}>
        {statuses.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[styles.chip, status === s.value && styles.chipActive]}
            onPress={() => setStatus(s.value)}
          >
            <Text style={[styles.chipText, status === s.value && styles.chipTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Expiry Date (YYYY-MM-DD)"
        value={expiryDate}
        onChangeText={setExpiryDate}
        placeholder="2026-04-15"
      />

      <Text style={styles.sectionLabel}>Nutrition (per 100g)</Text>
      <MacroBar macros={macros} />

      <Button title={submitLabel} onPress={handleSubmit} loading={loading} style={styles.submitBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#4CAF50' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
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
