import { useEffect } from 'react';
import { subscribeToCollection } from '@/services/firestore';

/**
 * Core real-time sync pattern:
 * Firestore onSnapshot → Zustand store → Components
 *
 * @param path - Firestore collection path
 * @param setter - Zustand setter function
 * @param enabled - Whether subscription is active (e.g., householdId exists)
 */
export function useFirestoreSubscription<T extends { id: string }>(
  path: string | null,
  setter: (items: T[]) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!path || !enabled) return;

    const unsubscribe = subscribeToCollection<T>(path, setter);
    return () => unsubscribe();
  }, [path, enabled]);
}
