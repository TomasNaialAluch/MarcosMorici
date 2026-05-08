import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { EquipoPreguntaDoc } from '@/lib/types/equipoPregunta';

const COL = 'equipoPreguntas';

function toDate(v: unknown): Date | null {
  if (!v || typeof v !== 'object') return null;
  if ('toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  return null;
}

function fromDoc(id: string, data: DocumentData): EquipoPreguntaDoc {
  return {
    id,
    equipoId: String(data.equipoId ?? ''),
    slug: String(data.slug ?? ''),
    nombre: String(data.nombre ?? ''),
    telefono: typeof data.telefono === 'string' && data.telefono.trim() ? data.telefono.trim() : null,
    texto: String(data.texto ?? ''),
    createdAt: toDate(data.createdAt),
    visible: data.visible !== false,
    respuesta: typeof data.respuesta === 'string' && data.respuesta.trim() ? data.respuesta.trim() : null,
    respondidoEn: toDate(data.respondidoEn),
    respondidoPorUid: typeof data.respondidoPorUid === 'string' ? data.respondidoPorUid : null,
  };
}

export type CrearPreguntaInput = {
  equipoId: string;
  slug: string;
  nombre: string;
  telefono: string | null;
  texto: string;
};

export async function crearEquipoPregunta(input: CrearPreguntaInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no disponible.' };
  const nombre = input.nombre.trim();
  const texto = input.texto.trim();
  const tel = input.telefono?.trim() || null;
  if (nombre.length < 2 || nombre.length > 120) {
    return { ok: false, error: 'Indicá un nombre válido (2 a 120 caracteres).' };
  }
  if (texto.length < 3 || texto.length > 2000) {
    return { ok: false, error: 'La pregunta debe tener entre 3 y 2000 caracteres.' };
  }
  if (tel && tel.length > 40) {
    return { ok: false, error: 'El teléfono es demasiado largo.' };
  }
  try {
    await addDoc(collection(db, COL), {
      equipoId: input.equipoId.trim(),
      slug: input.slug.trim(),
      nombre,
      telefono: tel,
      texto,
      createdAt: serverTimestamp(),
      visible: true,
      respuesta: null,
      respondidoEn: null,
      respondidoPorUid: null,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof FirebaseError) return { ok: false, error: `${e.message} (${e.code})` };
    return { ok: false, error: 'No se pudo guardar la pregunta.' };
  }
}

/** Visitantes: solo visibles. Admin: todas las del equipo (incl. ocultas). */
export async function listEquipoPreguntas(
  equipoId: string,
  options: { admin: boolean }
): Promise<EquipoPreguntaDoc[]> {
  if (!db) return [];
  const ref = collection(db, COL);
  let snap;
  try {
    if (options.admin) {
      snap = await getDocs(
        query(ref, where('equipoId', '==', equipoId), orderBy('createdAt', 'desc'), limit(80))
      );
    } else {
      snap = await getDocs(
        query(
          ref,
          where('equipoId', '==', equipoId),
          where('visible', '==', true),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      );
    }
  } catch {
    const q = query(ref, where('equipoId', '==', equipoId), limit(80));
    snap = await getDocs(q);
  }
  const rows: EquipoPreguntaDoc[] = [];
  snap.forEach((d) => {
    const row = fromDoc(d.id, d.data());
    if (!options.admin && !row.visible) return;
    rows.push(row);
  });
  rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  return rows;
}

/** Admin: preguntas públicas sin respuesta (más recientes primero; escanea los últimos N docs). */
export async function listPreguntasSinResponderAdmin(maxScan = 200): Promise<EquipoPreguntaDoc[]> {
  if (!db) return [];
  const ref = collection(db, COL);
  let snap;
  try {
    snap = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(maxScan)));
  } catch {
    snap = await getDocs(query(ref, limit(maxScan)));
  }
  const rows: EquipoPreguntaDoc[] = [];
  snap.forEach((d) => rows.push(fromDoc(d.id, d.data())));
  return rows.filter((p) => p.visible && !p.respuesta);
}

export async function countPreguntasSinResponderAdmin(): Promise<number> {
  const list = await listPreguntasSinResponderAdmin(200);
  return list.length;
}

/** Admin: últimas preguntas/comentarios (todas las visibilidades; orden por fecha). */
export async function listPreguntasRecientesAdmin(maxScan = 400): Promise<EquipoPreguntaDoc[]> {
  if (!db) return [];
  const ref = collection(db, COL);
  let snap;
  try {
    snap = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(maxScan)));
  } catch {
    snap = await getDocs(query(ref, limit(maxScan)));
  }
  const rows: EquipoPreguntaDoc[] = [];
  snap.forEach((d) => rows.push(fromDoc(d.id, d.data())));
  rows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  return rows;
}

export async function adminResponderPregunta(
  preguntaId: string,
  texto: string,
  adminUid: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no disponible.' };
  const body = texto.trim();
  if (body.length < 1 || body.length > 4000) {
    return { ok: false, error: 'La respuesta debe tener entre 1 y 4000 caracteres.' };
  }
  try {
    await updateDoc(doc(db, COL, preguntaId), {
      respuesta: body,
      respondidoEn: serverTimestamp(),
      respondidoPorUid: adminUid,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof FirebaseError) return { ok: false, error: `${e.message} (${e.code})` };
    return { ok: false, error: 'No se pudo guardar la respuesta.' };
  }
}

export async function adminOcultarPregunta(preguntaId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no disponible.' };
  try {
    await updateDoc(doc(db, COL, preguntaId), { visible: false });
    return { ok: true };
  } catch (e) {
    if (e instanceof FirebaseError) return { ok: false, error: `${e.message} (${e.code})` };
    return { ok: false, error: 'No se pudo ocultar la pregunta.' };
  }
}

/** Elimina definitivamente (solo admin). */
export async function adminEliminarPregunta(preguntaId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no disponible.' };
  try {
    await deleteDoc(doc(db, COL, preguntaId));
    return { ok: true };
  } catch (e) {
    if (e instanceof FirebaseError) return { ok: false, error: `${e.message} (${e.code})` };
    return { ok: false, error: 'No se pudo eliminar.' };
  }
}
