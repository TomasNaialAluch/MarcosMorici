'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RequireAdmin from '@/components/account/cuenta/RequireAdmin';
import MisEquipoEditarLoader from '@/components/account/publicaciones/MisEquipoEditarLoader';

function EditarPublicacionInner() {
  const searchParams = useSearchParams();
  const equipoId = searchParams.get('equipoId')?.trim() ?? '';

  if (!equipoId) {
    return (
      <div className="max-w-xl space-y-4">
        <p className="text-sm text-[#5A6C7D]">
          Abrí una publicación desde el listado para editarla (falta <code className="text-xs bg-[#F0F3F6] px-1 rounded">equipoId</code> en la
          URL).
        </p>
        <Link href="/cuenta/publicaciones" className="text-[#1E3A5F] font-semibold underline">
          ← Volver a publicaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/cuenta/publicaciones"
        className="text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline"
      >
        ← Publicaciones
      </Link>
      <div className="mt-4">
        <MisEquipoEditarLoader equipoId={decodeURIComponent(equipoId)} />
      </div>
    </div>
  );
}

export default function EditarPublicacionPage() {
  return (
    <RequireAdmin>
      <Suspense fallback={<p className="text-[#5A6C7D]">Cargando…</p>}>
        <EditarPublicacionInner />
      </Suspense>
    </RequireAdmin>
  );
}
