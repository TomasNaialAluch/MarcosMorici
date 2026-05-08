'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/account/providers/AuthProvider';
import type { Equipo } from '@/lib/types/equipo';
import { CUENTA_EQUIPO_EDIT_PLACEHOLDER } from '@/lib/cuenta/staticExportPlaceholders';
import { fetchEquipoById } from '@/lib/firebase/equipos';
import { fetchMisEquipoById } from '@/lib/firebase/misEquipos';
import MisEquipoForm from '@/components/account/publicaciones/MisEquipoForm';

export default function MisEquipoEditarLoader({ equipoId }: { equipoId: string }) {
  const { firebaseUser, isAdmin } = useAuth();
  const [equipo, setEquipo] = useState<Equipo | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (equipoId === CUENTA_EQUIPO_EDIT_PLACEHOLDER) {
      setEquipo(null);
      return;
    }
    if (!firebaseUser?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const e = isAdmin
          ? await fetchEquipoById(equipoId)
          : await fetchMisEquipoById(equipoId, firebaseUser.uid);
        if (!cancelled) setEquipo(e);
      } catch (err) {
        if (!cancelled) {
          setEquipo(null);
          setError(err instanceof Error ? err.message : 'Error al cargar.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [equipoId, firebaseUser?.uid, isAdmin]);

  if (equipoId === CUENTA_EQUIPO_EDIT_PLACEHOLDER) {
    return (
      <div className="max-w-xl text-center py-12 text-[#5A6C7D] text-sm">
        <p className="mb-4">Esta URL es solo para la build estática.</p>
        <Link href="/cuenta/publicaciones" className="font-semibold text-[#1E3A5F] underline">
          Ir a mis publicaciones
        </Link>
      </div>
    );
  }

  if (equipo === undefined) {
    return <p className="text-[#5A6C7D]">Cargando…</p>;
  }

  if (error || !equipo || !firebaseUser) {
    return (
      <div className="max-w-xl space-y-4">
        <p className="text-red-700 text-sm">{error ?? 'No encontramos ese equipo o no tenés permiso.'}</p>
        <Link href="/cuenta/publicaciones" className="text-[#1E3A5F] font-semibold underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const ownerUid = equipo.ownerId?.trim() || firebaseUser.uid;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-[#1E3A5F]">Editar publicación</h1>
      <MisEquipoForm mode="edit" ownerUid={ownerUid} equipoId={equipo.id} initial={equipo} />
    </div>
  );
}
