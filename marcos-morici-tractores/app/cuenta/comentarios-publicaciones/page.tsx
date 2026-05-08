'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/account/providers/AuthProvider';
import { fetchEquipoById } from '@/lib/firebase/equipos';
import {
  adminEliminarPregunta,
  adminOcultarPregunta,
  adminResponderPregunta,
  listEquipoPreguntas,
  listPreguntasRecientesAdmin,
} from '@/lib/firebase/equipoPreguntas';
import type { EquipoPreguntaDoc } from '@/lib/types/equipoPregunta';

const inputClass =
  'w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]';
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#1E3A5F] px-5 py-2 text-sm font-semibold uppercase text-white hover:bg-[#152d49] transition-colors disabled:opacity-50';
const btnGhost =
  'inline-flex items-center justify-center rounded-lg border-2 border-[#E0E5E9] px-4 py-2 text-xs font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors disabled:opacity-50';
const btnDanger =
  'inline-flex items-center justify-center rounded-lg border-2 border-red-200 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 transition-colors disabled:opacity-50';

type EquipoResumen = {
  equipoId: string;
  slug: string;
  titulo: string;
  total: number;
  sinResponder: number;
  lastAt: number;
};

function agruparPorEquipo(docs: EquipoPreguntaDoc[]): EquipoResumen[] {
  const byId = new Map<string, { slug: string; items: EquipoPreguntaDoc[] }>();
  for (const p of docs) {
    const id = p.equipoId?.trim();
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, { slug: p.slug || id, items: [] });
    byId.get(id)!.items.push(p);
  }
  const out: EquipoResumen[] = [];
  for (const [equipoId, { slug, items }] of byId) {
    const sinResponder = items.filter((d) => d.visible && !d.respuesta).length;
    const lastAt = Math.max(...items.map((d) => d.createdAt?.getTime() ?? 0), 0);
    out.push({
      equipoId,
      slug,
      titulo: slug,
      total: items.length,
      sinResponder,
      lastAt,
    });
  }
  out.sort((a, b) => b.lastAt - a.lastAt);
  return out;
}

const PAGE_SIZE_GRUPOS = 12;
const PAGE_SIZE_PREGUNTAS = 12;

type FiltroLista = 'todos' | 'pendiente' | 'respondido';

function filtrarResumenes(rows: EquipoResumen[], texto: string, filtro: FiltroLista): EquipoResumen[] {
  const t = texto.trim().toLowerCase();
  return rows.filter((r) => {
    if (filtro === 'pendiente' && r.sinResponder === 0) return false;
    if (filtro === 'respondido' && r.sinResponder > 0) return false;
    if (!t) return true;
    const hayTitulo = r.titulo.toLowerCase().includes(t);
    const haySlug = r.slug.toLowerCase().includes(t);
    const hayId = r.equipoId.toLowerCase().includes(t);
    return hayTitulo || haySlug || hayId;
  });
}

type FiltroDetalle = 'todos' | 'sin_respuesta' | 'con_respuesta' | 'ocultas';

function filtrarPreguntasDetalle(rows: EquipoPreguntaDoc[], filtro: FiltroDetalle): EquipoPreguntaDoc[] {
  return rows.filter((p) => {
    if (filtro === 'sin_respuesta') return Boolean(p.visible) && !(p.respuesta?.trim());
    if (filtro === 'con_respuesta') return Boolean(p.respuesta?.trim());
    if (filtro === 'ocultas') return !p.visible;
    return true;
  });
}

export default function ComentariosPublicacionesPage() {
  return (
    <Suspense fallback={<p className="text-[#5A6C7D]">Cargando…</p>}>
      <ComentariosPublicacionesInner />
    </Suspense>
  );
}

function ComentariosPublicacionesInner() {
  const searchParams = useSearchParams();
  const equipoIdParam = searchParams.get('equipoId')?.trim() ?? '';

  const { isAdmin, loading, firebaseUser } = useAuth();
  const [resumenes, setResumenes] = useState<EquipoResumen[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const [detalleItems, setDetalleItems] = useState<EquipoPreguntaDoc[]>([]);
  const [detalleTitulo, setDetalleTitulo] = useState('');
  const [detalleSlug, setDetalleSlug] = useState('');
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [listaBusqueda, setListaBusqueda] = useState('');
  const [listaFiltro, setListaFiltro] = useState<FiltroLista>('todos');
  const [listaPage, setListaPage] = useState(1);

  const [detalleFiltro, setDetalleFiltro] = useState<FiltroDetalle>('todos');
  const [detallePage, setDetallePage] = useState(1);

  const reloadLista = useCallback(async () => {
    setLoadingList(true);
    setLoadErr(null);
    try {
      const docs = await listPreguntasRecientesAdmin(400);
      const grupos = agruparPorEquipo(docs);
      const enriched = await Promise.all(
        grupos.map(async (g) => {
          const eq = await fetchEquipoById(g.equipoId);
          const titulo = (eq?.titulo || `${eq?.marca ?? ''} ${eq?.modelo ?? ''}`).trim() || g.slug;
          return { ...g, titulo, slug: eq?.slug || g.slug };
        })
      );
      setResumenes(enriched);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'No se pudo cargar.');
      setResumenes([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const cargarDetalle = useCallback(async (equipoId: string) => {
    setLoadingDetalle(true);
    setLoadErr(null);
    try {
      const eq = await fetchEquipoById(equipoId);
      const titulo = (eq?.titulo || `${eq?.marca ?? ''} ${eq?.modelo ?? ''}`).trim() || 'Publicación';
      setDetalleTitulo(titulo);
      setDetalleSlug(eq?.slug || '');
      const rows = await listEquipoPreguntas(equipoId, { admin: true });
      setDetalleItems(rows);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'No se pudo cargar la publicación.');
      setDetalleItems([]);
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || loading) return;
    void reloadLista();
  }, [isAdmin, loading, reloadLista]);

  useEffect(() => {
    if (!isAdmin || loading || !equipoIdParam) {
      setDetalleItems([]);
      setDetalleTitulo('');
      setDetalleSlug('');
      return;
    }
    void cargarDetalle(equipoIdParam);
  }, [isAdmin, loading, equipoIdParam, cargarDetalle]);

  useEffect(() => {
    setDetalleFiltro('todos');
    setDetallePage(1);
  }, [equipoIdParam]);

  const detalleHref = useMemo(() => {
    if (!detalleSlug) return null;
    return `/comprar/${encodeURIComponent(detalleSlug)}#preguntas-publicas`;
  }, [detalleSlug]);

  const resumenesFiltrados = useMemo(
    () => filtrarResumenes(resumenes, listaBusqueda, listaFiltro),
    [resumenes, listaBusqueda, listaFiltro]
  );

  const listaTotalPages = Math.max(1, Math.ceil(resumenesFiltrados.length / PAGE_SIZE_GRUPOS));
  const listaPageSafe = Math.min(listaPage, listaTotalPages);

  useEffect(() => {
    setListaPage((p) => Math.min(p, listaTotalPages));
  }, [listaTotalPages]);

  useEffect(() => {
    setListaPage(1);
  }, [listaBusqueda, listaFiltro]);

  const resumenesPagina = useMemo(() => {
    const start = (listaPageSafe - 1) * PAGE_SIZE_GRUPOS;
    return resumenesFiltrados.slice(start, start + PAGE_SIZE_GRUPOS);
  }, [resumenesFiltrados, listaPageSafe]);

  const preguntasFiltradas = useMemo(
    () => filtrarPreguntasDetalle(detalleItems, detalleFiltro),
    [detalleItems, detalleFiltro]
  );

  const detalleTotalPages = Math.max(1, Math.ceil(preguntasFiltradas.length / PAGE_SIZE_PREGUNTAS));
  const detallePageSafe = Math.min(detallePage, detalleTotalPages);

  useEffect(() => {
    setDetallePage((p) => Math.min(p, detalleTotalPages));
  }, [detalleTotalPages]);

  const preguntasPagina = useMemo(() => {
    const start = (detallePageSafe - 1) * PAGE_SIZE_PREGUNTAS;
    return preguntasFiltradas.slice(start, start + PAGE_SIZE_PREGUNTAS);
  }, [preguntasFiltradas, detallePageSafe]);

  const selectListaFiltro = (f: FiltroLista) => {
    setListaFiltro(f);
  };

  const selectDetalleFiltro = (f: FiltroDetalle) => {
    setDetalleFiltro(f);
  };

  useEffect(() => {
    setDetallePage(1);
  }, [detalleFiltro]);

  if (loading) {
    return <p className="text-[#5A6C7D]">Cargando sesión…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Solo los administradores pueden ver los comentarios a publicaciones.
      </div>
    );
  }

  if (equipoIdParam) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link
            href="/cuenta/comentarios-publicaciones"
            className="text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline"
          >
            ← Todas las publicaciones con comentarios
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-[#1E3A5F] uppercase tracking-tight mb-1">{detalleTitulo || '…'}</h1>
        <p className="text-sm text-[#5A6C7D] mb-6">
          Todas las preguntas de esta máquina. Podés responder, editar la respuesta u ocultar / eliminar cuando quieras.
        </p>
        {detalleHref ? (
          <Link
            href={detalleHref}
            className="text-sm font-semibold text-[#1E3A5F] underline hover:text-[#D9773F] mb-8 inline-block"
          >
            Abrir ficha en el catálogo →
          </Link>
        ) : null}

        {loadErr ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {loadErr}
          </div>
        ) : null}

        {loadingDetalle ? (
          <p className="text-[#5A6C7D]">Cargando preguntas…</p>
        ) : detalleItems.length === 0 ? (
          <p className="text-[#5A6C7D]">No hay preguntas guardadas para esta publicación.</p>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3">
              <p className="text-xs font-bold uppercase text-[#5A6C7D]">Filtrar en esta publicación</p>
              <div className="flex flex-wrap gap-2">
                <FiltroChip
                  active={detalleFiltro === 'todos'}
                  onClick={() => selectDetalleFiltro('todos')}
                  label="Todas"
                />
                <FiltroChip
                  active={detalleFiltro === 'sin_respuesta'}
                  onClick={() => selectDetalleFiltro('sin_respuesta')}
                  label="Sin respuesta"
                />
                <FiltroChip
                  active={detalleFiltro === 'con_respuesta'}
                  onClick={() => selectDetalleFiltro('con_respuesta')}
                  label="Con respuesta"
                />
                <FiltroChip
                  active={detalleFiltro === 'ocultas'}
                  onClick={() => selectDetalleFiltro('ocultas')}
                  label="Ocultas"
                />
              </div>
            </div>
            {preguntasFiltradas.length === 0 ? (
              <p className="text-[#5A6C7D]">No hay comentarios que coincidan con este filtro.</p>
            ) : (
              <>
                <ul className="space-y-8">
                  {preguntasPagina.map((p) => (
              <li key={p.id} className="rounded-xl border border-[#E0E5E9] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-[#1E3A5F]">{p.nombre}</p>
                  <time className="text-xs text-[#8A9BA8]" dateTime={p.createdAt?.toISOString()}>
                    {p.createdAt
                      ? p.createdAt.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
                      : ''}
                  </time>
                </div>
                {p.telefono ? (
                  <p className="text-xs text-[#5A6C7D] mb-2">
                    Tel.: <span className="font-mono text-[#1E3A5F]">{p.telefono}</span>
                  </p>
                ) : null}
                {!p.visible ? (
                  <p className="text-xs font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block mb-2">
                    Oculta para el público
                  </p>
                ) : null}
                <p className="text-sm text-[#374151] whitespace-pre-wrap border-l-4 border-[#E0E5E9] pl-3 mb-3">{p.texto}</p>
                {p.respuesta ? (
                  <div className="mb-4 pl-3 border-l-4 border-[#4A7C59] bg-[#F8FAFB] rounded-r py-2 pr-2">
                    <p className="text-xs font-bold uppercase text-[#4A7C59] mb-1">Respuesta publicada</p>
                    <p className="text-sm text-[#5A6C7D] whitespace-pre-wrap">{p.respuesta}</p>
                  </div>
                ) : null}
                {firebaseUser ? (
                  <PreguntaAccionesAdmin
                    pregunta={p}
                    adminUid={firebaseUser.uid}
                    onDone={async () => {
                      await cargarDetalle(equipoIdParam);
                      await reloadLista();
                    }}
                  />
                ) : null}
              </li>
                  ))}
                </ul>
                <PaginationBar
                  page={detallePageSafe}
                  totalPages={detalleTotalPages}
                  totalItems={preguntasFiltradas.length}
                  pageSize={PAGE_SIZE_PREGUNTAS}
                  onPrev={() => setDetallePage((p) => Math.max(1, p - 1))}
                  onNext={() => setDetallePage((p) => Math.min(detalleTotalPages, p + 1))}
                />
              </>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] uppercase tracking-tight mb-2">Comentarios a publicaciones</h1>
      <p className="text-[#5A6C7D] text-sm mb-8 max-w-2xl">
        Elegí una publicación que tenga preguntas. Dentro podés responder, modificar la respuesta cuando quieras u ocultar
        o eliminar el comentario.
      </p>

      {loadErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {loadErr}
        </div>
      ) : null}

      {loadingList ? (
        <p className="text-[#5A6C7D]">Cargando…</p>
      ) : resumenes.length === 0 ? (
        <p className="text-[#5A6C7D]">Todavía no hay comentarios en publicaciones (últimos movimientos).</p>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="flex-1 min-w-[220px] max-w-xl">
              <label htmlFor="busq-pub-comentarios" className="block text-xs font-semibold text-[#1E3A5F] mb-1.5">
                Buscar publicación
              </label>
              <input
                id="busq-pub-comentarios"
                type="search"
                value={listaBusqueda}
                onChange={(e) => setListaBusqueda(e.target.value)}
                className={inputClass}
                placeholder="Título, slug o id…"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#5A6C7D] uppercase">Estado</span>
              <div className="flex flex-wrap gap-2">
                <FiltroChip
                  active={listaFiltro === 'todos'}
                  onClick={() => selectListaFiltro('todos')}
                  label="Todas"
                />
                <FiltroChip
                  active={listaFiltro === 'pendiente'}
                  onClick={() => selectListaFiltro('pendiente')}
                  label="Con pendientes"
                />
                <FiltroChip
                  active={listaFiltro === 'respondido'}
                  onClick={() => selectListaFiltro('respondido')}
                  label="Al día"
                />
              </div>
            </div>
          </div>
          {resumenesFiltrados.length === 0 ? (
            <p className="text-[#5A6C7D]">No hay publicaciones que coincidan con la búsqueda o el filtro elegido.</p>
          ) : (
            <>
              <ul className="grid gap-4 sm:grid-cols-2">
                {resumenesPagina.map((r) => (
                  <li key={r.equipoId}>
                    <Link
                      href={`/cuenta/comentarios-publicaciones?equipoId=${encodeURIComponent(r.equipoId)}`}
                      className={`block rounded-xl border p-5 shadow-sm transition-colors h-full ${
                        r.sinResponder > 0
                          ? 'border-[#D9773F]/60 bg-amber-50/40 ring-1 ring-[#D9773F]/30 hover:bg-amber-50/70'
                          : 'border-[#E0E5E9] bg-white hover:border-[#1E3A5F]/30 hover:bg-[#F8FAFB]'
                      }`}
                    >
                      <p className="font-bold text-[#1E3A5F] leading-snug line-clamp-2">{r.titulo}</p>
                      <p className="text-xs text-[#8A9BA8] mt-1 font-mono truncate">{r.slug}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase">
                        <span className="rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] px-2.5 py-1">{r.total} comentarios</span>
                        {r.sinResponder > 0 ? (
                          <span className="rounded-full bg-[#D9773F] text-white px-2.5 py-1">
                            {r.sinResponder} sin responder
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#E0E5E9] text-[#5A6C7D] px-2.5 py-1">Al día</span>
                        )}
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[#4A7C59]">Gestionar →</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <PaginationBar
                page={listaPageSafe}
                totalPages={listaTotalPages}
                totalItems={resumenesFiltrados.length}
                pageSize={PAGE_SIZE_GRUPOS}
                onPrev={() => setListaPage((p) => Math.max(1, p - 1))}
                onNext={() => setListaPage((p) => Math.min(listaTotalPages, p + 1))}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

function FiltroChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold uppercase transition-colors ${
        active
          ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white'
          : 'border-[#E0E5E9] text-[#1E3A5F] hover:border-[#1E3A5F]/40 bg-white'
      }`}
    >
      {label}
    </button>
  );
}

function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalItems <= 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#E0E5E9] pt-6">
      <p className="text-sm text-[#5A6C7D]">
        Mostrando <span className="font-semibold text-[#1E3A5F]">{from}</span>–<span className="font-semibold text-[#1E3A5F]">{to}</span> de{' '}
        <span className="font-semibold text-[#1E3A5F]">{totalItems}</span>
        {totalPages > 1 ? (
          <span className="text-[#8A9BA8]">
            {' '}
            · Página {page} de {totalPages}
          </span>
        ) : null}
      </p>
      {totalPages > 1 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={onPrev}
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#E0E5E9] px-4 py-2 text-xs font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={onNext}
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#E0E5E9] px-4 py-2 text-xs font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PreguntaAccionesAdmin({
  pregunta,
  adminUid,
  onDone,
}: {
  pregunta: EquipoPreguntaDoc;
  adminUid: string;
  onDone: () => Promise<void>;
}) {
  const [respuesta, setRespuesta] = useState(pregunta.respuesta ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setRespuesta(pregunta.respuesta ?? '');
  }, [pregunta.id, pregunta.respuesta]);

  const guardar = async () => {
    setErr(null);
    setBusy(true);
    const r = await adminResponderPregunta(pregunta.id, respuesta, adminUid);
    setBusy(false);
    if (!r.ok) setErr(r.error);
    else await onDone();
  };

  const ocultar = async () => {
    if (!globalThis.confirm('¿Ocultar este comentario para el público?')) return;
    setBusy(true);
    const r = await adminOcultarPregunta(pregunta.id);
    setBusy(false);
    if (!r.ok) setErr(r.error);
    else await onDone();
  };

  const eliminar = async () => {
    if (!globalThis.confirm('¿Eliminar definitivamente?')) return;
    setBusy(true);
    const r = await adminEliminarPregunta(pregunta.id);
    setBusy(false);
    if (!r.ok) setErr(r.error);
    else await onDone();
  };

  const tieneRespuesta = Boolean((pregunta.respuesta?.trim() ?? '') || respuesta.trim());

  return (
    <div className="pt-4 border-t border-[#E0E5E9] space-y-3">
      <p className="text-xs font-bold uppercase text-[#5A6C7D]">Administración</p>
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <label className="block text-xs font-medium text-[#1E3A5F]" htmlFor={`r-${pregunta.id}`}>
        {tieneRespuesta ? 'Respuesta (podés editarla y guardar de nuevo)' : 'Respuesta pública'}
      </label>
      <textarea
        id={`r-${pregunta.id}`}
        rows={4}
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        className={`${inputClass} resize-y min-h-[88px]`}
        placeholder="Escribí o actualizá la respuesta…"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void guardar()} className={btnPrimary}>
          {busy ? 'Guardando…' : tieneRespuesta ? 'Guardar cambios' : 'Publicar respuesta'}
        </button>
        {pregunta.visible ? (
          <button type="button" disabled={busy} onClick={() => void ocultar()} className={btnGhost}>
            Ocultar
          </button>
        ) : null}
        <button type="button" disabled={busy} onClick={() => void eliminar()} className={btnDanger}>
          Eliminar
        </button>
      </div>
    </div>
  );
}
