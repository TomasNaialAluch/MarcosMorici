'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/account/providers/AuthProvider';

export default function CuentaAuthGate({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      const next =
        pathname && pathname.startsWith('/cuenta') ? pathname : '/cuenta/perfil';
      router.replace(`/acceso?redirect=${encodeURIComponent(next)}`);
    }
  }, [loading, firebaseUser, router, pathname]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <p className="text-[#5A6C7D]">Cargando sesión…</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <p className="text-[#5A6C7D]">Redirigiendo a ingresar o registrarse…</p>
      </div>
    );
  }

  return <>{children}</>;
}
