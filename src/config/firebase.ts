import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// For Firebase v12+, use browserLocalPersistence (works in Expo/RN web & native)
// For a more native solution, consider @react-native-firebase/auth
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
} catch {
  // Auth already initialized (e.g., hot reload)
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
