import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Macros } from '@/types';

interface MacroBarProps {
  macros: Macros;
  compact?: boolean;
}

export function MacroBar({ macros, compact }: MacroBarProps) {
  if (compact) {
    return (
      <Text style={styles.compact}>
        {macros.calories} cal · {macros.protein}g P · {macros.carbs}g C · {macros.fat}g F
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <MacroItem label="Cal" value={macros.calories} color="#FF9800" unit="" />
      <MacroItem label="Protein" value={macros.protein} color="#4CAF50" unit="g" />
      <MacroItem label="Carbs" value={macros.carbs} color="#2196F3" unit="g" />
      <MacroItem label="Fat" value={macros.fat} color="#F44336" unit="g" />
    </View>
  );
}

function MacroItem({ label, value, color, unit }: { label: string; value: number; color: string; unit: string }) {
  return (
    <View style={styles.item}>
      <Text style={[styles.value, { color }]}>{value}{unit}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  item: { alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 11, color: '#888', marginTop: 2 },
  compact: { fontSize: 12, color: '#888' },
});
