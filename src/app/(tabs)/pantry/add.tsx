import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { PantryItemForm } from '@/components/pantry/PantryItemForm';
import { usePantryStore } from '@/stores/pantryStore';
import { useAuthStore } from '@/stores/authStore';

export default function AddPantryItemScreen() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const addItem = usePantryStore((s) => s.addItem);

  const handleSubmit = async (values: any) => {
    if (!user?.householdId) return;
    setLoading(true);
    try {
      await addItem(user.householdId, {
        ...values,
        addedBy: user.uid,
        addedByName: user.displayName,
        lastUpdatedBy: user.uid,
        lastUpdatedByName: user.displayName,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return <PantryItemForm onSubmit={handleSubmit} loading={loading} />;
}
