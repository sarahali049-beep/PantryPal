import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { GroceryItemForm } from '@/components/grocery/GroceryItemForm';
import { useGroceryStore } from '@/stores/groceryStore';
import { useAuthStore } from '@/stores/authStore';

export default function AddGroceryItemScreen() {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const addItem = useGroceryStore((s) => s.addItem);

  const handleSubmit = async (values: any) => {
    if (!user?.householdId) return;
    setLoading(true);
    try {
      await addItem(user.householdId, {
        ...values,
        checked: false,
        addedBy: user.uid,
        addedByName: user.displayName,
        fromRecipe: null,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return <GroceryItemForm onSubmit={handleSubmit} loading={loading} />;
}
