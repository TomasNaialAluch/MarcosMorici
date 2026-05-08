'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/account/providers/AuthProvider';
import { countPreguntasSinResponderAdmin } from '@/lib/firebase/equipoPreguntas';

const tabBase =
  'rounded-lg px-4 py-2 text-sm font-semibold uppercase transition-colors inline-flex items-center gap-2';

function tabClass(href: string, pathname: string, activeExtra?: string) {
  const active =
    href === '/cuenta/perfil'
      ? pathname === '/cuenta/perfil' || pathname === '/cuenta'
      : pathname === href || pathname.startsWith(`${href}/`);
  return active
    ? `bg-[#1E3A5F] text-white ${tabBase} ${activeExtra ?? ''}`
    : `text-[#1E3A5F] border border-[#E0E5E9] bg-white hover:bg-[#F0F3F6] ${tabBase} ${activeExtra ?? ''}`;
}

export default function CuentaTabs() {
  const pathname = usePathname() ?? '';
  const { isAdmin, loading } = useAuth();
  const [pendientes, setPendientes] = useState<number | null>(null);

  const fetchPendientes = useCallback(async () => {
    if (!isAdmin) {
      setPendientes(null);
      return;
    }
    try {
      const n = await countPreguntasSinResponderAdmin();
      setPendientes(n);
    } catch {
      setPendientes(null);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (loading || !isAdmin) return;
    void fetchPendientes();
    const t = setInterval(() => void fetchPendientes(), 45000);
    return () => clearInterval(t);
  }, [loading, isAdmin, fetchPendientes]);

  useEffect(() => {
    if (!isAdmin) return;
    if (pathname.startsWith('/cuenta/comentarios-publicaciones')) {
      void fetchPendientes();
    }
  }, [pathname, isAdmin, fetchPendientes]);

  const alertaPendientes = pendientes != null && pendientes > 0;

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[#E0E5E9] pb-4" aria-label="Secciones de cuenta">
      <Link href="/cuenta/perfil" className={tabClass('/cuenta/perfil', pathname)}>
        Perfil
      </Link>
      {isAdmin ? (
        <Link href="/cuenta/publicaciones" className={tabClass('/cuenta/publicaciones', pathname)}>
          Publicaciones
        </Link>
      ) : null}
      {isAdmin ? (
        <Link
          href="/cuenta/comentarios-publicaciones"
          className={`${tabClass('/cuenta/comentarios-publicaciones', pathname, alertaPendientes ? 'ring-2 ring-[#D9773F]/70 ring-offset-2 ring-offset-[#F8FAFB]' : '')}`}
          aria-label={
            alertaPendientes
              ? `Comentarios a publicaciones, ${pendientes} sin atender`
              : 'Comentarios a publicaciones'
          }
        >
          <span>Comentarios a publicaciones</span>
          {alertaPendientes ? (
            <span className="min-w-[1.35rem] px-1.5 py-0.5 rounded-full bg-[#D9773F] text-white text-[10px] font-bold leading-none tabular-nums animate-pulse">
              {pendientes > 99 ? '99+' : pendientes}
            </span>
          ) : null}
        </Link>
      ) : null}
      {isAdmin ? (
        <Link href="/cuenta/solicitudes-vender" className={tabClass('/cuenta/solicitudes-vender', pathname)}>
          Solicitudes vender
        </Link>
      ) : null}
    </nav>
  );
}
