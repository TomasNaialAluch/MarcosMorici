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
  if (!db) return;

  const ref = doc(db, USERS, uid);
  const snap = await getDoc(ref);
  const now = serverTimestamp();

  if (!snap.exists()) {
    await setDoc(ref, {
      email: fields.email,
      displayName: fields.displayName,
      photoURL: fields.photoURL,
      role: 'user' satisfies AccountRole,
      createdAt: now,
      updatedAt: now,
    });
    return;
  }

  await updateDoc(ref, {
    email: fields.email,
    displayName: fields.displayName,
    photoURL: fields.photoURL,
    updatedAt: now,
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const ref = doc(db, USERS, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return userProfileFromDoc(uid, snap.data());
}
