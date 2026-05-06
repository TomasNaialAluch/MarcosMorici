'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/account/providers/AuthProvider';

/**
 * Contenedor de providers de cuenta / sesión.
 * Acá se pueden sumar Theme, QueryClient, etc., sin tocar el root layout.
 */
export default function AccountProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
