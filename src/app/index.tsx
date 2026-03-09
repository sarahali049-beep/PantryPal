import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }
  if (!user.householdId) {
    return <Redirect href="/(auth)/join-household" />;
  }
  return <Redirect href="/(tabs)/pantry" />;
}
