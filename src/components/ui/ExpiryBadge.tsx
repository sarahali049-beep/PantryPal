import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getExpiryLevel, getExpiryColor, daysUntilExpiry } from '@/utils/dates';

interface ExpiryBadgeProps {
  expiryDate: string | null;
}

export function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  if (!expiryDate) return null;

  const level = getExpiryLevel(expiryDate);
  const color = getExpiryColor(level);
  const days = daysUntilExpiry(expiryDate);

  const label =
    level === 'expired'
      ? 'Expired'
      : level === 'urgent'
      ? `${days}d left!`
      : level === 'soon'
      ? `${days}d left`
      : `${days}d`;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  text: { fontSize: 12, fontWeight: '600' },
});
