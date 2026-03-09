import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePantryStore } from '@/stores/pantryStore';
import { useAuthStore } from '@/stores/authStore';
import { MacroBar } from '@/components/ui/MacroBar';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/dates';

export default function PantryItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { items, deleteItem, updateItem } = usePantryStore();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Item not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Item', `Remove "${item.name}" from pantry?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (user?.householdId) {
            await deleteItem(user.householdId, item.id);
            router.back();
          }
        },
      },
    ]);
  };

  const cycleStatus = async () => {
    if (!user?.householdId) return;
    const next = item.status === 'in_stock' ? 'low' : item.status === 'low' ? 'out' : 'in_stock';
    await updateItem(user.householdId, item.id, {
      status: next,
      lastUpdatedBy: user.uid,
      lastUpdatedByName: user.displayName,
    });
  };

  const statusColors: Record<string, string> = {
    in_stock: '#4CAF50',
    low: '#FFC107',
    out: '#F44336',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <ExpiryBadge expiryDate={item.expiryDate} />
      </View>

      <View style={styles.infoRow}>
        <InfoItem label="Category" value={item.category} />
        <InfoItem label="Quantity" value={`${item.quantity} ${item.unit}`} />
      </View>

      <Button
        title={`Status: ${item.status.replace('_', ' ').toUpperCase()}`}
        onPress={cycleStatus}
        style={{ backgroundColor: statusColors[item.status], marginBottom: 16 }}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition (per 100g)</Text>
        <MacroBar macros={item.macros} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <InfoItem label="Expiry" value={formatDate(item.expiryDate)} />
        <InfoItem label="Added by" value={item.addedByName} />
        <InfoItem label="Last updated by" value={item.lastUpdatedByName} />
      </View>

      <Button title="Delete Item" onPress={handleDelete} variant="danger" style={styles.deleteBtn} />
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '800', color: '#333', flex: 1, marginRight: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 16 },
  section: { marginBottom: 20, backgroundColor: '#F9F9F9', borderRadius: 12, padding: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#555', marginBottom: 8 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  deleteBtn: { marginTop: 20, marginBottom: 40 },
  notFound: { fontSize: 18, color: '#999', textAlign: 'center', marginTop: 60 },
});
