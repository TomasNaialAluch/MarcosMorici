import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasFirebase = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
);

function getOrInitApp(): FirebaseApp | undefined {
  if (!hasFirebase) return undefined;
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

const app = getOrInitApp();

export const db: Firestore | null = app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;

/** Auth solo en el navegador; usar en componentes `use client`. */
export function getClientAuth(): Auth | null {
  if (!app || typeof window === 'undefined') return null;
  return getAuth(app);
}

export const initAnalytics = async () => {
  if (!app || typeof window === 'undefined') return null;
  const supported = await isSupported();
  if (supported) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
