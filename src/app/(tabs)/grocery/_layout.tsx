import { Stack } from 'expo-router';

export default function GroceryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Grocery List' }} />
      <Stack.Screen name="add" options={{ title: 'Add Item' }} />
    </Stack>
  );
}
