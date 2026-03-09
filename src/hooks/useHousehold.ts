import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { subscribeToHousehold } from '@/services/firestore';

export function useHousehold() {
  const user = useAuthStore((s) => s.user);
  const { household, setHousehold } = useHouseholdStore();

  useEffect(() => {
    if (!user?.householdId) {
      setHousehold(null);
      return;
    }

    const unsubscribe = subscribeToHousehold(user.householdId, setHousehold);
    return () => unsubscribe();
  }, [user?.householdId]);

  return { household };
}
