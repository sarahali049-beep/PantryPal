import { Stack } from 'expo-router';

export default function PantryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Pantry' }} />
      <Stack.Screen name="add" options={{ title: 'Add Item' }} />
      <Stack.Screen name="[id]" options={{ title: 'Item Details' }} />
    </Stack>
  );
}
