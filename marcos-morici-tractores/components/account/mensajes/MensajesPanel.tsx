'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/account/providers/AuthProvider';
import {
  addMensaje,
  createConversation,
  fetchConversacionesAdmin,
  fetchMensajes,
  fetchMisConversaciones,
  type ConversationListItem,
  type MensajeItem,
} from '@/lib/firebase/conversaciones';

const btnPrimary =
  'inline-flex justify-center rounded-lg bg-[#1E3A5F] px-4 py-2 text-sm font-semibold uppercase text-white hover:bg-[#152d49] transition-colors disabled:opacity-50';
const btnGhost =
  'inline-flex justify-center rounded-lg border-2 border-[#E0E5E9] px-4 py-2 text-sm font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors';

function MensajesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('c');
  const { firebaseUser, isAdmin } = useAuth();

  const [list, setList] = useState<ConversationListItem[]>([]);
  const [loadingList, setLoadingList] = useState(!conversationId);
  const [messages, setMessages] = useState<MensajeItem[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(!!conversationId);
  const [text, setText] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loadList = useCallback(async () => {
    if (!firebaseUser?.uid) return;
    setLoadingList(true);
    setError(null);
    try {
      if (isAdmin) {
        setList(await fetchConversacionesAdmin());
      } else {
        setList(await fetchMisConversaciones(firebaseUser.uid));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las conversaciones.');
    } finally {
      setLoadingList(false);
    }
  }, [firebaseUser?.uid, isAdmin]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoadingMsg(true);
    setError(null);
    try {
      setMessages(await fetchMensajes(conversationId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los mensajes.');
    } finally {
      setLoadingMsg(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const openConversation = (id: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('c', id);
    router.push(`/cuenta/mensajes?${p.toString()}`);
  };

  const closeConversation = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('c');
    router.push(`/cuenta/mensajes?${p.toString()}`);
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !firebaseUser?.uid) return;
    setPending(true);
    setError(null);
    const r = await addMensaje(conversationId, firebaseUser.uid, text);
    setPending(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setText('');
    await loadMessages();
    await loadList();
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser?.uid) return;
    setPending(true);
    setError(null);
    const r = await createConversation(firebaseUser.uid, newTitle);
    setPending(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setNewTitle('');
    await loadList();
    openConversation(r.id);
  };

  const activeTitle = useMemo(() => {
    if (!conversationId) return '';
    return list.find((x) => x.id === conversationId)?.title ?? 'Conversación';
  }, [conversationId, list]);

  if (!firebaseUser) return null;

  if (conversationId) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <button type="button" onClick={closeConversation} className="text-sm font-semibold text-[#1E3A5F] underline">
              ← Volver al listado
            </button>
            <h1 className="mt-2 text-xl font-bold text-[#1E3A5F]">{activeTitle || 'Conversación'}</h1>
            <p className="mt-1 text-sm text-[#5A6C7D]">
              {isAdmin
                ? 'Como administrador podés escribir en hilos de clientes cuando las reglas de Firestore lo permitan.'
                : 'Mensajes guardados en Firestore (colección conversaciones / mensajes).'}
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}

        <div className="rounded-lg border border-[#E0E5E9] bg-white p-4 min-h-[200px] space-y-3">
          {loadingMsg ? (
            <p className="text-[#5A6C7D] text-sm">Cargando mensajes…</p>
          ) : messages.length === 0 ? (
            <p className="text-[#5A6C7D] text-sm">Sin mensajes todavía.</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => {
                const mine = m.senderUid === firebaseUser.uid;
                return (
                  <li
                    key={m.id}
                    className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                      mine ? 'ml-auto bg-[#E8F4F8] text-[#1E3A5F]' : 'mr-auto bg-[#F0F3F6] text-[#1E3A5F]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className="mt-1 text-[10px] uppercase text-[#8A9BA8]">
                      {mine ? 'Vos' : isAdmin && m.senderUid !== firebaseUser.uid ? 'Cliente' : 'Otro'}{' '}
                      {m.createdAt
                        ? `· ${m.createdAt.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`
                        : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form onSubmit={onSend} className="flex flex-col gap-2">
          <label htmlFor="msg-text" className="text-xs font-semibold uppercase text-[#5A6C7D]">
            Escribí un mensaje
          </label>
          <textarea
            id="msg-text"
            className="w-full rounded-lg border border-[#E0E5E9] px-3 py-2 text-sm text-[#1E3A5F] min-h-[88px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Consulta, seguimiento de una publicación, etc."
          />
          <button type="submit" className={btnPrimary} disabled={pending}>
            {pending ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1E3A5F]">Mensajes</h1>
        <p className="mt-1 text-sm text-[#5A6C7D]">
          {isAdmin
            ? 'Listado de conversaciones recientes en Firestore (todas las que podés leer como administrador).'
            : 'Conversaciones vinculadas a tu cuenta (Firestore: colección conversaciones).'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={onCreate} className="rounded-lg border border-[#E0E5E9] bg-white p-4 space-y-3 shadow-sm">
        <p className="text-sm font-semibold text-[#1E3A5F]">Nueva conversación</p>
        <input
          className="w-full rounded-lg border border-[#E0E5E9] px-3 py-2 text-sm text-[#1E3A5F]"
          placeholder="Asunto (ej. consulta por una retro)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className={btnGhost} disabled={pending}>
          Crear y abrir
        </button>
      </form>

      <div>
        <h2 className="text-sm font-bold uppercase text-[#5A6C7D] mb-2">Tus conversaciones</h2>
        {loadingList ? (
          <p className="text-[#5A6C7D] text-sm">Cargando…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-[#8A9BA8]">Todavía no hay conversaciones.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => openConversation(row.id)}
                  className="w-full text-left rounded-lg border border-[#E0E5E9] bg-white px-4 py-3 hover:border-[#1E3A5F]/40 transition-colors"
                >
                  <p className="font-semibold text-[#1E3A5F]">{row.title}</p>
                  <p className="text-xs text-[#5A6C7D] truncate">{row.lastMessage}</p>
                  {isAdmin && (
                    <p className="text-[10px] text-[#8A9BA8] mt-0.5">Cliente UID: {row.customerUid}</p>
                  )}
                  <p className="text-[10px] text-[#8A9BA8] mt-1">
                    {row.updatedAt?.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) ?? ''}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-[#8A9BA8]">
        Las conversaciones y mensajes viven en Firestore. Desplegá las reglas del repositorio para habilitar lectura
        y escritura.
      </p>
    </div>
  );
}

function MensajesFallback() {
  return (
    <div className="max-w-2xl py-12">
      <p className="text-[#5A6C7D]">Cargando mensajes…</p>
    </div>
  );
}

export default function MensajesPanel() {
  return (
    <Suspense fallback={<MensajesFallback />}>
      <MensajesInner />
    </Suspense>
  );
}
