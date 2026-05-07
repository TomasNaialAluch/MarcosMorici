import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { db, storage, isFirestoreConfigured } from '@/lib/firebase/config';
import { ensureAnonymousUid } from '@/lib/firebase/anonymousSession';
import type { VenderSimpleFormState, SolicitudStatus } from '@/lib/types/venderSolicitud';
import { VENDER_SOLICITUDES_COLLECTION } from '@/lib/vender/constants';
import type { VenderFormState } from '@/lib/types/venderLead';

export interface PersistSimpleResult {
  ok: boolean;
  solicitudId?: string;
  error?: string;
  filesUploaded: boolean;
  storageWarning?: string;
}

function randomClientFolder(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function formatFirebaseError(e: unknown, fallback: string): string {
  if (e instanceof FirebaseError) {
    if (e.code === 'permission-denied') {
      return `${fallback} (permission-denied). Revisá reglas de Firestore o Storage.`;
    }
    return `${e.message} (${e.code})`;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

async function uploadSimpleFiles(
  uid: string,
  clientFolder: string,
  state: VenderSimpleFormState
): Promise<{ folletoUrl: string | null; imagenesUrls: string[]; error?: string }> {
  if (!storage) {
    return { folletoUrl: null, imagenesUrls: [], error: 'Storage no está configurado.' };
  }

  const base = `vender_solicitudes/${uid}/${clientFolder}`;
  let folletoUrl: string | null = null;
  const imagenesUrls: string[] = [];

  try {
    if (state.folleto) {
      const safeName = state.folleto.name.replace(/[^\w.\-]+/g, '_');
      const r = ref(storage, `${base}/folleto_${safeName}`);
      await uploadBytes(r, state.folleto);
      folletoUrl = await getDownloadURL(r);
    }

    for (let i = 0; i < state.imagenes.length; i++) {
      const f = state.imagenes[i];
      const safeName = f.name.replace(/[^\w.\-]+/g, '_');
      const r = ref(storage, `${base}/img_${i}_${safeName}`);
      await uploadBytes(r, f);
      imagenesUrls.push(await getDownloadURL(r));
    }
  } catch (e) {
    return {
      folletoUrl,
      imagenesUrls,
      error: formatFirebaseError(e, 'Error al subir archivos'),
    };
  }

  return { folletoUrl, imagenesUrls };
}

export async function persistVenderSolicitud(state: VenderSimpleFormState): Promise<PersistSimpleResult> {
  if (!isFirestoreConfigured() || !db) {
    return {
      ok: false,
      error:
        'Firebase no está conectado: completá `.env.local` con las claves web (incluido NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET si subís fotos). Reiniciá el servidor de desarrollo tras guardar.',
      filesUploaded: false,
    };
  }

  const authResult = await ensureAnonymousUid();
  if ('error' in authResult) {
    return { ok: false, error: authResult.error, filesUploaded: false };
  }
  const uid = authResult.uid;

  const clientFolder = randomClientFolder();
  let folletoUrl: string | null = null;
  let imagenesUrls: string[] = [];
  let storageWarning: string | undefined;
  let filesUploaded = false;

  const wantsFiles = Boolean(state.folleto || state.imagenes.length > 0);

  if (wantsFiles) {
    const up = await uploadSimpleFiles(uid, clientFolder, state);
    folletoUrl = up.folletoUrl;
    imagenesUrls = up.imagenesUrls;
    if (up.error) storageWarning = up.error;
    filesUploaded = Boolean(folletoUrl || imagenesUrls.length > 0);
  }

  const docPayload = {
    source: 'web-vender-simple',
    ownerId: uid,
    clientFolder,
    createdAt: Timestamp.now(),
    marca: state.marca.trim(),
    modelo: state.modelo.trim(),
    descripcion: state.descripcion.trim() || null,
    precio: state.precioConsultar ? null : state.precio.trim() || null,
    precioConsultar: Boolean(state.precioConsultar),
    moneda: state.moneda,
    nombreApellido: state.nombreApellido.trim(),
    email: state.email.trim(),
    celular: state.celular.trim(),
    ubicacion: state.ubicacion.trim() || null,
    folletoUrl,
    imagenesUrls,
    status: 'pending' as SolicitudStatus,
  };

  try {
    const refDoc = await addDoc(collection(db, VENDER_SOLICITUDES_COLLECTION), docPayload);
    let finalStorageWarning = storageWarning;
    if (wantsFiles && !filesUploaded && !finalStorageWarning) {
      finalStorageWarning =
        'No se pudieron subir los archivos. Revisá reglas de Storage y NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.';
    }
    return {
      ok: true,
      solicitudId: refDoc.id,
      filesUploaded,
      storageWarning: finalStorageWarning,
    };
  } catch (e) {
    return {
      ok: false,
      error: formatFirebaseError(e, 'No se pudo guardar la solicitud'),
      filesUploaded,
      storageWarning,
    };
  }
}

export interface VenderSolicitudDoc {
  id: string;
  ownerId: string;
  marca: string;
  modelo: string;
  descripcion: string | null;
  precio: string | null;
  precioConsultar: boolean;
  moneda: string;
  nombreApellido: string;
  email: string;
  celular: string;
  ubicacion: string | null;
  folletoUrl: string | null;
  imagenesUrls: string[];
  status: SolicitudStatus;
  createdAt: unknown;
  publishedLeadId?: string | null;
}

function solicitudFromData(id: string, data: DocumentData): VenderSolicitudDoc {
  const imagenesUrls = Array.isArray(data.imagenesUrls)
    ? (data.imagenesUrls as unknown[]).filter((u): u is string => typeof u === 'string')
    : [];
  return {
    id,
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
    marca: typeof data.marca === 'string' ? data.marca : '',
    modelo: typeof data.modelo === 'string' ? data.modelo : '',
    descripcion: typeof data.descripcion === 'string' ? data.descripcion : null,
    precio: typeof data.precio === 'string' ? data.precio : data.precio == null ? null : String(data.precio),
    precioConsultar: Boolean(data.precioConsultar),
    moneda: typeof data.moneda === 'string' ? data.moneda : 'pesos',
    nombreApellido: typeof data.nombreApellido === 'string' ? data.nombreApellido : '',
    email: typeof data.email === 'string' ? data.email : '',
    celular: typeof data.celular === 'string' ? data.celular : '',
    ubicacion: typeof data.ubicacion === 'string' ? data.ubicacion : null,
    folletoUrl: typeof data.folletoUrl === 'string' ? data.folletoUrl : null,
    imagenesUrls,
    status: data.status === 'published' || data.status === 'rejected' ? data.status : 'pending',
    createdAt: data.createdAt,
    publishedLeadId: typeof data.publishedLeadId === 'string' ? data.publishedLeadId : null,
  };
}

/** Para precargar el formulario admin a partir de una solicitud. */
export function solicitudToVenderPrefill(s: VenderSolicitudDoc): Partial<VenderFormState> {
  const precioStr =
    s.precioConsultar || !s.precio ? '' : String(s.precio).replace(/^Consultar$/i, '').trim() || String(s.precio);

  return {
    marca: s.marca,
    modelo: s.modelo,
    descripcionMaquina: s.descripcion ?? '',
    precio: precioStr,
    precioConsultar: s.precioConsultar,
    moneda: s.moneda === 'dolar' ? 'dolar' : 'pesos',
    folletoUrl: s.folletoUrl ?? '',
    nombreApellido: s.nombreApellido,
    email: s.email,
    celular: s.celular,
    ubicacion: s.ubicacion ?? '',
    titulo: '',
    categoria: '',
    tipoMaquinaria: '',
    horas: '',
    ano: '',
    mensajeAdicional: `[Solicitud ${s.id}] ${s.imagenesUrls.length} foto(s) cargadas por el usuario — revisá enlaces en el panel de solicitudes.`,
  };
}

export async function fetchVenderSolicitudById(id: string): Promise<VenderSolicitudDoc | null> {
  if (!db) return null;
  const ref = doc(db, VENDER_SOLICITUDES_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return solicitudFromData(id, snap.data());
}

export async function listPendingVenderSolicitudes(): Promise<VenderSolicitudDoc[]> {
  if (!db) return [];
  const q = query(collection(db, VENDER_SOLICITUDES_COLLECTION), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => solicitudFromData(d.id, d.data()));
  list.sort((a, b) => {
    const ta = a.createdAt && typeof (a.createdAt as { seconds?: number }).seconds === 'number' ? (a.createdAt as { seconds: number }).seconds : 0;
    const tb = b.createdAt && typeof (b.createdAt as { seconds?: number }).seconds === 'number' ? (b.createdAt as { seconds: number }).seconds : 0;
    return tb - ta;
  });
  return list;
}

export async function markSolicitudPublished(
  solicitudId: string,
  publishedLeadId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!db) return { ok: false, error: 'Firestore no disponible.' };
  try {
    const ref = doc(db, VENDER_SOLICITUDES_COLLECTION, solicitudId);
    await updateDoc(ref, {
      status: 'published',
      publishedLeadId,
      processedAt: Timestamp.now(),
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: formatFirebaseError(e, 'No se pudo actualizar la solicitud'),
    };
  }
}
