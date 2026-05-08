'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/components/account/providers/AuthProvider';

type Props = { children: ReactNode };

/**
 * Envuelve páginas de cuenta reservadas a administradores (Firestore `users/{uid}.role == 'admin'`).
 */
export default function RequireAdmin({ children }: Props) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return <p className="text-[#5A6C7D]">Cargando sesión…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Solo los administradores pueden acceder a esta sección.
      </div>
    );
  }

  return <>{children}</>;
}
