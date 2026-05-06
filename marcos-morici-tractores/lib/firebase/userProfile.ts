import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AccountRole, UserProfile } from '@/lib/types/user';

const USERS = 'users';

function roleFromData(data: DocumentData): AccountRole {
  if (data.role === 'admin') return 'admin';
  const roles = data.roles;
  if (Array.isArray(roles) && roles.includes('admin')) return 'admin';
  return 'user';
}

export function userProfileFromDoc(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    email: typeof data.email === 'string' ? data.email : null,
    displayName: typeof data.displayName === 'string' ? data.displayName : null,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    role: roleFromData(data),
  };
}

/**
 * Crea el documento `users/{uid}` con `role: 'user'` si no existe.
 * Si ya existe, actualiza espejo de Auth sin pisar `role` (para conservar `admin` asignado en consola).
 */
export async function ensureUserProfile(
  uid: string,
  fields: { email: string | null; displayName: string | null; photoURL: string | null }
): Promise<void> {
  if (!db) {
    throw new Error(
      'Firestore no está disponible. Completá NEXT_PUBLIC_FIREBASE_* en `.env.local` (mismo proyecto que Authentication) y reiniciá el servidor.'
    );
  }

  const ref = doc(db, USERS, uid);
  const snap = await getDoc(ref);
  const now = serverTimestamp();
  const email = fields.email ?? null;
  const displayName = fields.displayName ?? null;
  const photoURL = fields.photoURL ?? null;

  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      displayName,
      photoURL,
      role: 'user' satisfies AccountRole,
      createdAt: now,
      updatedAt: now,
    });
    return;
  }

  await updateDoc(ref, {
    email,
    displayName,
    photoURL,
    updatedAt: now,
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) {
    throw new Error(
      'Firestore no está disponible. Completá NEXT_PUBLIC_FIREBASE_* en `.env.local` y reiniciá el servidor.'
    );
  }
  const ref = doc(db, USERS, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return userProfileFromDoc(uid, snap.data());
}
