import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlannerStore } from '@/stores/plannerStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { useAuthStore } from '@/stores/authStore';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { MacroBar } from '@/components/ui/MacroBar';
import { getWeekDays } from '@/utils/dates';
import { MealPlanWeek, MealSlot } from '@/types';

const mealSlots: { key: MealSlot; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { key: 'snack', label: 'Snack', icon: 'cafe-outline' },
];

export default function PlannerScreen() {
  const user = useAuthStore((s) => s.user);
  const favorites = useRecipeStore((s) => s.favorites);
  const { weekPlan, currentWeekId, setWeekPlan, assignRecipe, getDayMacros, getWeekMacros } = usePlannerStore();

  const householdId = user?.householdId;

  // Subscribe to meal plan for current week
  useFirestoreSubscription<MealPlanWeek>(
    householdId ? `households/${householdId}/mealPlan` : null,
    (plans) => {
      const current = plans.find((p) => p.id === currentWeekId);
      setWeekPlan(current || null);
    },
    !!householdId
  );

  const weekDays = getWeekDays(currentWeekId);
  const weekMacros = getWeekMacros(favorites);

  const handleSlotPress = (dayKey: string, slot: MealSlot) => {
    if (favorites.length === 0) {
      Alert.alert('No Recipes', 'Save some recipes to favorites first!');
      return;
    }

    const options = favorites.map((r) => r.title);
    options.push('Clear Slot');
    options.push('Cancel');

    Alert.alert('Assign Recipe', `Select a recipe for ${slot}`, [
      ...favorites.map((r) => ({
        text: r.title,
        onPress: () => householdId && assignRecipe(householdId, dayKey, slot, r.id),
      })),
      {
        text: 'Clear Slot',
        style: 'destructive' as const,
        onPress: () => householdId && assignRecipe(householdId, dayKey, slot, null),
      },
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const getRecipeName = (recipeId: string | null): string => {
    if (!recipeId) return 'Tap to assign';
    return favorites.find((r) => r.id === recipeId)?.title || 'Unknown recipe';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.weekHeader}>
        <Text style={styles.weekTitle}>Week {currentWeekId}</Text>
      </View>

      <View style={styles.weekMacros}>
        <Text style={styles.macroLabel}>Weekly Totals</Text>
        <MacroBar macros={weekMacros} />
      </View>

      {weekDays.map(({ key, label }) => {
        const dayMacros = getDayMacros(key, favorites);
        const dayPlan = weekPlan?.days?.[key];

        return (
          <View key={key} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{label}</Text>
              {dayMacros.calories > 0 && (
                <Text style={styles.dayCalories}>{dayMacros.calories} cal</Text>
              )}
            </View>

            {mealSlots.map(({ key: slot, label: slotLabel, icon }) => {
              const recipeId = dayPlan?.[slot] || null;
              const recipeName = getRecipeName(recipeId);

              return (
                <TouchableOpacity
                  key={slot}
                  style={styles.slotRow}
                  onPress={() => handleSlotPress(key, slot)}
                >
                  <Ionicons name={icon} size={18} color="#888" />
                  <Text style={styles.slotLabel}>{slotLabel}</Text>
                  <Text
                    style={[styles.slotRecipe, !recipeId && styles.slotEmpty]}
                    numberOfLines={1}
                  >
                    {recipeName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  weekHeader: { padding: 16, alignItems: 'center' },
  weekTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  weekMacros: { backgroundColor: '#FFF', padding: 12, marginHorizontal: 16, borderRadius: 12, marginBottom: 12 },
  macroLabel: { fontSize: 13, fontWeight: '600', color: '#666', textAlign: 'center', marginBottom: 4 },
  dayCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
  },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  dayCalories: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  slotLabel: { fontSize: 13, color: '#888', width: 70 },
  slotRecipe: { flex: 1, fontSize: 14, color: '#333' },
  slotEmpty: { color: '#CCC', fontStyle: 'italic' },
  spacer: { height: 20 },
});
