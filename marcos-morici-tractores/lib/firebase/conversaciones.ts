import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const COL = 'conversaciones';

export type ConversationListItem = {
  id: string;
  customerUid: string;
  title: string;
  lastMessage: string;
  updatedAt: Date | null;
};

export type MensajeItem = {
  id: string;
  senderUid: string;
  text: string;
  createdAt: Date | null;
};

function toDate(v: unknown): Date | null {
  if (!v || typeof v !== 'object') return null;
  if ('toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  return null;
}

function formatErr(e: unknown, fb: string): string {
  if (e instanceof FirebaseError) return `${fb}: ${e.message} (${e.code})`;
  if (e instanceof Error) return e.message;
  return fb;
}

export async function fetchMisConversaciones(customerUid: string): Promise<ConversationListItem[]> {
  if (!db) return [];
  const q = query(collection(db, COL), where('customerUid', '==', customerUid));
  const snap = await getDocs(q);
  const rows: ConversationListItem[] = [];
  snap.forEach((d) => {
    const x = d.data();
    rows.push({
      id: d.id,
      customerUid: String(x.customerUid ?? ''),
      title: String(x.title ?? 'Conversación'),
      lastMessage: String(x.lastMessage ?? ''),
      updatedAt: toDate(x.updatedAt) ?? toDate(x.createdAt),
    });
  });
  rows.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
  return rows;
}

/** Listado reciente para administradores (requiere reglas que permitan lectura a `role == admin`). */
export async function fetchConversacionesAdmin(): Promise<ConversationListItem[]> {
  if (!db) return [];
  let snap;
  try {
    snap = await getDocs(query(collection(db, COL), orderBy('updatedAt', 'desc'), limit(80)));
  } catch {
    snap = await getDocs(collection(db, COL));
  }
  const rows: ConversationListItem[] = [];
  snap.forEach((d) => {
    const x = d.data();
    rows.push({
      id: d.id,
      customerUid: String(x.customerUid ?? ''),
      title: String(x.title ?? 'Conversación'),
      lastMessage: String(x.lastMessage ?? ''),
      updatedAt: toDate(x.updatedAt) ?? toDate(x.createdAt),
    });
  });
  rows.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
  return rows;
}

export async function createConversation(customerUid: string, title: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no disponible.' };
  const t = title.trim().slice(0, 200);
  if (!t) return { ok: false, error: 'Escribí un asunto.' };
  try {
    const ref = await addDoc(collection(db, COL), {
      customerUid,
      title: t,
      lastMessage: 'Conversación iniciada.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (e) {
    return { ok: false, error: formatErr(e, 'No se pudo crear la conversación') };
  }
}

export async function fetchMensajes(conversationId: string): Promise<MensajeItem[]> {
  if (!db) return [];
  const ref = collection(db, COL, conversationId, 'mensajes');
  let snap;
  try {
    snap = await getDocs(query(ref, orderBy('createdAt', 'asc')));
  } catch {
    snap = await getDocs(ref);
  }
  const list: MensajeItem[] = [];
  snap.forEach((d) => {
    const x = d.data();
    list.push({
      id: d.id,
      senderUid: String(x.senderUid ?? ''),
      text: String(x.text ?? ''),
      createdAt: toDate(x.createdAt),
    });
  });
  list.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
  return list;
}

export async function addMensaje(
  conversationId: string,
  senderUid: string,
  text: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no disponible.' };
  const body = text.trim().slice(0, 4000);
  if (!body) return { ok: false, error: 'Escribí un mensaje.' };
  try {
    const parent = doc(db, COL, conversationId);
    await addDoc(collection(db, COL, conversationId, 'mensajes'), {
      senderUid,
      text: body,
      createdAt: serverTimestamp(),
    });
    await updateDoc(parent, {
      lastMessage: body.length > 120 ? `${body.slice(0, 117)}…` : body,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatErr(e, 'No se pudo enviar') };
  }
}
