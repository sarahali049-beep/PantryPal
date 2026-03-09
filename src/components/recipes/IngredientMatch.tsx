import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeIngredient } from '@/types';

interface IngredientMatchProps {
  ingredient: RecipeIngredient;
}

export function IngredientMatch({ ingredient }: IngredientMatchProps) {
  const inPantry = ingredient.inPantry ?? false;

  return (
    <View style={styles.row}>
      <Ionicons
        name={inPantry ? 'checkmark-circle' : 'close-circle'}
        size={20}
        color={inPantry ? '#4CAF50' : '#F44336'}
      />
      <Text style={[styles.text, !inPantry && styles.textMissing]}>
        {ingredient.amount} {ingredient.unit} {ingredient.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  text: { fontSize: 15, color: '#333' },
  textMissing: { color: '#F44336' },
});
