'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/account/providers/AuthProvider';
import type { Equipo } from '@/lib/types/equipo';
import { deleteMisEquipo, fetchMisEquipos } from '@/lib/firebase/misEquipos';
import { fetchTodosEquiposAdmin } from '@/lib/firebase/equipos';
import { formatPrecioLista } from '@/lib/catalog/catalogUtils';

export default function MisPublicacionesClient() {
  const { firebaseUser, isAdmin } = useAuth();
  const [rows, setRows] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        setRows(await fetchTodosEquiposAdmin(500));
      } else {
        setRows(await fetchMisEquipos(firebaseUser.uid));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las publicaciones.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser?.uid, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async (id: string, ownerId: string | undefined) => {
    if (!firebaseUser?.uid) return;
    if (!window.confirm('¿Eliminar esta publicación? No se puede deshacer.')) return;
    setDeleting(id);
    setError(null);
    const owner = ownerId || firebaseUser.uid;
    const r = await deleteMisEquipo(owner, id);
    setDeleting(null);
    if (!r.ok) setError(r.error);
    else await load();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F]">{isAdmin ? 'Publicaciones' : 'Mis publicaciones'}</h1>
          <p className="mt-1 text-sm text-[#5A6C7D]">
            {isAdmin
              ? 'Listado de todas las máquinas en Firestore (hasta 500 más recientes). Podés editar o eliminar cualquier ficha.'
              : 'Equipos vinculados a tu cuenta en Firestore. Podés editarlos, ocultarlos del catálogo o eliminarlos.'}
          </p>
        </div>
        <Link
          href="/cuenta/publicaciones/nuevo"
          className="inline-flex justify-center rounded-lg bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold uppercase text-white hover:bg-[#152d49] transition-colors"
        >
          Nueva publicación
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[#5A6C7D]">Cargando…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-[#E0E5E9] bg-[#F8FAFB] p-8 text-center text-[#5A6C7D]">
          <p className="mb-4">
            {isAdmin ? 'No se encontraron equipos en la colección (o no tenés permisos de admin).' : 'Todavía no cargaste ninguna máquina desde tu cuenta.'}
          </p>
          <Link href="/cuenta/publicaciones/nuevo" className="font-semibold text-[#1E3A5F] underline">
            Crear primera publicación
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-[#E0E5E9] bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[#1E3A5F] truncate">{e.titulo}</p>
                <p className="text-xs text-[#5A6C7D]">
                  {e.publicado ? 'Visible en catálogo' : 'Borrador / no publicado'} ·{' '}
                  {formatPrecioLista(e)}
                  {isAdmin && e.ownerId ? (
                    <>
                      {' '}
                      · Owner: <span className="font-mono text-[11px]">{e.ownerId.slice(0, 8)}…</span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href={`/comprar/${encodeURIComponent(e.slug)}`}
                  className="rounded-lg border border-[#E0E5E9] px-3 py-1.5 text-xs font-semibold uppercase text-[#1E3A5F] hover:bg-[#F0F3F6]"
                >
                  Ver
                </a>
                <Link
                  href={`/cuenta/publicaciones/editar?equipoId=${encodeURIComponent(e.id)}`}
                  className="rounded-lg border border-[#E0E5E9] px-3 py-1.5 text-xs font-semibold uppercase text-[#1E3A5F] hover:bg-[#F0F3F6]"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={deleting === e.id}
                  onClick={() => onDelete(e.id, e.ownerId)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold uppercase text-red-800 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting === e.id ? '…' : 'Eliminar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
