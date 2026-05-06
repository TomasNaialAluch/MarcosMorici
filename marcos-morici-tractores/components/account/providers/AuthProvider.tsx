'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/config';
import { ensureUserProfile, fetchUserProfile } from '@/lib/firebase/userProfile';
import type { UserProfile } from '@/lib/types/user';

export type AuthContextValue = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfileForUser = useCallback(async (u: User) => {
    setProfileError(null);
    try {
      await ensureUserProfile(u.uid, {
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
      });
      const p = await fetchUserProfile(u.uid);
      setProfile(p);
    } catch (e) {
      setProfile(null);
      setProfileError(e instanceof Error ? e.message : 'No se pudo cargar el perfil.');
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const auth = getClientAuth();
    const u = auth?.currentUser;
    if (!u) {
      setProfile(null);
      return;
    }
    await loadProfileForUser(u);
  }, [loadProfileForUser]);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      queueMicrotask(() => {
        setLoading(false);
      });
      return;
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        await loadProfileForUser(u);
      } else {
        setProfile(null);
        setProfileError(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [loadProfileForUser]);

  const signOut = useCallback(async () => {
    const auth = getClientAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      profileError,
      signOut,
      refreshProfile,
      isAdmin: profile?.role === 'admin',
    }),
    [firebaseUser, profile, loading, profileError, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
