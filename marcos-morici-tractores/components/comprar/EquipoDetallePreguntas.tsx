'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Equipo } from '@/lib/types/equipo';
import { useAuth } from '@/components/account/providers/AuthProvider';
import {
  adminEliminarPregunta,
  adminOcultarPregunta,
  adminResponderPregunta,
  crearEquipoPregunta,
  listEquipoPreguntas,
} from '@/lib/firebase/equipoPreguntas';
import type { EquipoPreguntaDoc } from '@/lib/types/equipoPregunta';

const inputClass =
  'w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] placeholder:text-[#5A6C7D] focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]';
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold uppercase text-white hover:bg-[#152d49] transition-colors disabled:opacity-50';
const btnGhost =
  'inline-flex items-center justify-center rounded-lg border-2 border-[#E0E5E9] px-4 py-2 text-xs font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors disabled:opacity-50';
const btnDanger =
  'inline-flex items-center justify-center rounded-lg border-2 border-red-200 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50 transition-colors disabled:opacity-50';

export default function EquipoDetallePreguntas({ equipo }: { equipo: Equipo }) {
  const { isAdmin, firebaseUser } = useAuth();
  const [items, setItems] = useState<EquipoPreguntaDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [texto, setTexto] = useState('');
  const [envBusy, setEnvBusy] = useState(false);
  const [envMsg, setEnvMsg] = useState<'idle' | 'ok' | 'err'>('idle');
  const [envErrDetail, setEnvErrDetail] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const rows = await listEquipoPreguntas(equipo.id, { admin: isAdmin });
      setItems(rows);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'No se pudieron cargar las preguntas.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [equipo.id, isAdmin]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvMsg('idle');
    setEnvErrDetail(null);
    setEnvBusy(true);
    const r = await crearEquipoPregunta({
      equipoId: equipo.id,
      slug: equipo.slug,
      nombre: nombre.trim(),
      telefono: telefono.trim() || null,
      texto: texto.trim(),
    });
    setEnvBusy(false);
    if (r.ok) {
      setEnvMsg('ok');
      setTexto('');
      await reload();
    } else {
      setEnvMsg('err');
      setEnvErrDetail(r.error);
    }
  };

  return (
    <section
      id="preguntas-publicas"
      className="rounded-xl border border-[#E0E5E9] bg-white p-5 md:p-6 shadow-sm mt-10"
      aria-labelledby="preguntas-equipo-heading"
    >
      <h2 id="preguntas-equipo-heading" className="text-lg font-bold text-[#1E3A5F] uppercase mb-2">
        Preguntas
      </h2>
      <p className="text-sm text-[#5A6C7D] mb-6">
        Dejá tu consulta con tu nombre. Podés sumar WhatsApp o teléfono si querés que te contactemos.
      </p>
      {isAdmin ? (
        <p className="text-xs text-[#5A6C7D] mb-6 -mt-4">
          Para ver todas las preguntas de esta máquina, editar respuestas después o eliminar:{' '}
          <Link href={`/cuenta/comentarios-publicaciones?equipoId=${encodeURIComponent(equipo.id)}`} className="font-semibold text-[#1E3A5F] underline hover:text-[#D9773F]">
            abrir panel de comentarios
          </Link>
          .
        </p>
      ) : null}

      <form onSubmit={onEnviar} className="space-y-4 max-w-xl mb-10 pb-10 border-b border-[#E0E5E9]">
        <div>
          <label htmlFor="preg-nombre" className="block text-sm font-medium text-[#1E3A5F] mb-1">
            Nombre <span className="text-[#D9773F]">*</span>
          </label>
          <input
            id="preg-nombre"
            name="nombre"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
            placeholder="Cómo te llamás"
          />
        </div>
        <div>
          <label htmlFor="preg-tel" className="block text-sm font-medium text-[#1E3A5F] mb-1">
            WhatsApp o teléfono <span className="text-[#5A6C7D] font-normal">(opcional)</span>
          </label>
          <input
            id="preg-tel"
            name="telefono"
            maxLength={40}
            inputMode="tel"
            autoComplete="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className={inputClass}
            placeholder="Ej. +54 9 11 …"
          />
        </div>
        <div>
          <label htmlFor="preg-texto" className="block text-sm font-medium text-[#1E3A5F] mb-1">
            Pregunta <span className="text-[#D9773F]">*</span>
          </label>
          <textarea
            id="preg-texto"
            name="pregunta"
            required
            minLength={3}
            maxLength={2000}
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className={`${inputClass} resize-y min-h-[100px]`}
            placeholder="Escribí tu consulta sobre esta máquina…"
          />
        </div>
        {envMsg === 'ok' && (
          <p className="text-sm text-[#4A7C59] font-medium" role="status">
            Pregunta publicada. Gracias.
          </p>
        )}
        {envMsg === 'err' && (
          <p className="text-sm text-red-600" role="alert">
            {envErrDetail ?? 'No se pudo enviar. Revisá los datos o probá más tarde.'}
          </p>
        )}
        <button type="submit" disabled={envBusy} className={btnPrimary}>
          {envBusy ? 'Enviando…' : 'Publicar pregunta'}
        </button>
      </form>

      {loadErr ? (
        <p className="text-sm text-red-600" role="alert">
          {loadErr}
        </p>
      ) : loading ? (
        <p className="text-sm text-[#5A6C7D]">Cargando preguntas…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#5A6C7D]">Todavía no hay preguntas públicas.</p>
      ) : (
        <ul className="space-y-8">
          {items.map((p) => (
            <li key={p.id} className="rounded-lg border border-[#E0E5E9] bg-[#F8FAFB]/50 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <p className="font-semibold text-[#1E3A5F]">{p.nombre}</p>
                <time className="text-xs text-[#8A9BA8]" dateTime={p.createdAt?.toISOString()}>
                  {p.createdAt
                    ? p.createdAt.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
                    : ''}
                </time>
              </div>
              {p.telefono ? (
                <p className="text-xs text-[#5A6C7D] mb-2">
                  Contacto: <span className="font-mono text-[#1E3A5F]">{p.telefono}</span>
                </p>
              ) : null}
              {!p.visible && isAdmin ? (
                <p className="text-xs font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block mb-2">
                  Oculta (solo vos la ves)
                </p>
              ) : null}
              <p className="text-sm text-[#374151] whitespace-pre-wrap mb-3">{p.texto}</p>
              {p.respuesta ? (
                <div className="mt-3 pl-3 border-l-4 border-[#4A7C59] bg-white rounded-r py-2 pr-2">
                  <p className="text-xs font-bold uppercase text-[#4A7C59] mb-1">Respuesta</p>
                  <p className="text-sm text-[#5A6C7D] whitespace-pre-wrap">{p.respuesta}</p>
                  {p.respondidoEn ? (
                    <p className="text-[10px] text-[#8A9BA8] mt-1">
                      {p.respondidoEn.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {isAdmin && firebaseUser ? (
                <AdminPreguntaControls
                  pregunta={p}
                  adminUid={firebaseUser.uid}
                  onChanged={reload}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AdminPreguntaControls({
  pregunta,
  adminUid,
  onChanged,
}: {
  pregunta: EquipoPreguntaDoc;
  adminUid: string;
  onChanged: () => Promise<void>;
}) {
  const [respuesta, setRespuesta] = useState(pregunta.respuesta ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setRespuesta(pregunta.respuesta ?? '');
  }, [pregunta.id, pregunta.respuesta]);

  const tieneRespuesta = Boolean((pregunta.respuesta?.trim() ?? '') || respuesta.trim());

  const guardarRespuesta = async () => {
    setErr(null);
    setBusy(true);
    const r = await adminResponderPregunta(pregunta.id, respuesta, adminUid);
    setBusy(false);
    if (!r.ok) setErr(r.error);
    else await onChanged();
  };

  const ocultar = async () => {
    if (!globalThis.confirm('¿Ocultar esta pregunta para el público?')) return;
    setBusy(true);
    const r = await adminOcultarPregunta(pregunta.id);
    setBusy(false);
    if (!r.ok) setErr(r.error);
    else await onChanged();
  };

  const eliminar = async () => {
    if (!globalThis.confirm('¿Eliminar esta pregunta de forma permanente?')) return;
    setBusy(true);
    const r = await adminEliminarPregunta(pregunta.id);
    setBusy(false);
    if (!r.ok) setErr(r.error);
    else await onChanged();
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#E0E5E9] space-y-3">
      <p className="text-xs font-bold uppercase text-[#5A6C7D]">Administración</p>
      {err ? (
        <p className="text-xs text-red-600" role="alert">
          {err}
        </p>
      ) : null}
      <label className="block text-xs font-medium text-[#1E3A5F]" htmlFor={`resp-${pregunta.id}`}>
        {tieneRespuesta ? 'Respuesta (visible para todos; podés editarla)' : 'Respuesta (visible para todos)'}
      </label>
      <textarea
        id={`resp-${pregunta.id}`}
        rows={4}
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        className={`${inputClass} resize-y min-h-[88px]`}
        placeholder="Escribí o actualizá la respuesta…"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void guardarRespuesta()} className={btnPrimary}>
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
