import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Macros } from '@/types';
import { MacroBar } from '@/components/ui/MacroBar';

interface MacroSummaryProps {
  macros: Macros;
  label?: string;
}

export function MacroSummary({ macros, label = 'Per Serving' }: MacroSummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <MacroBar macros={macros} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 4, textAlign: 'center' },
});
