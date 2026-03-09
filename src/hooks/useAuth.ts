import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { onAuthStateChanged, getUserProfile } from '@/services/auth';

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(
          profile || {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            householdId: null,
          }
        );
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  return { user, isLoading };
}
