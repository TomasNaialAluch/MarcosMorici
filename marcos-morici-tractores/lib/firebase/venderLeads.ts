import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { db, storage, isFirestoreConfigured } from '@/lib/firebase/config';
import type { VenderFormState } from '@/lib/types/venderLead';
import { VENDER_LEADS_COLLECTION } from '@/lib/vender/constants';
import { getMachineFieldVisibility } from '@/lib/vender/fieldVisibility';

export interface PersistLeadResult {
  ok: boolean;
  leadId?: string;
  error?: string;
  filesUploaded: boolean;
  /** Adjuntos no subidos a Storage (ej. reglas o red); el lead igual puede haberse guardado. */
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
      return `${fallback} (permission-denied). Revisá reglas de Firestore o Storage en Firebase Console, o desplegá las del repo.`;
    }
    return `${e.message} (${e.code})`;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

async function uploadVenderFiles(
  clientFolder: string,
  state: VenderFormState
): Promise<{ folletoUrl: string | null; imagenesUrls: string[]; error?: string }> {
  if (!storage) {
    return { folletoUrl: null, imagenesUrls: [], error: 'Storage no está configurado (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).' };
  }

  const base = `vender_leads/${clientFolder}`;
  let folletoUrl: string | null = null;
  const imagenesUrls: string[] = [];

  try {
    if (state.folleto) {
      const safeName = state.folleto.name.replace(/[^\w.\-]+/g, '_');
      const r = ref(storage, `${base}/folleto_${Date.now()}_${safeName}`);
      await uploadBytes(r, state.folleto, { contentType: state.folleto.type || undefined });
      folletoUrl = await getDownloadURL(r);
    }

    for (let i = 0; i < state.imagenes.length; i++) {
      const file = state.imagenes[i];
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const r = ref(storage, `${base}/img_${Date.now()}_${i}_${safeName}`);
      await uploadBytes(r, file, { contentType: file.type || undefined });
      imagenesUrls.push(await getDownloadURL(r));
    }
  } catch (e) {
    return {
      folletoUrl,
      imagenesUrls,
      error: formatFirebaseError(e, 'No se pudieron subir los archivos'),
    };
  }

  return { folletoUrl, imagenesUrls };
}

function parseNum(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Guarda el lead en Firestore (`venderLeads`) y sube adjuntos a Storage bajo `vender_leads/{clientFolder}/`.
 */
export async function persistVenderLead(state: VenderFormState): Promise<PersistLeadResult> {
  if (!isFirestoreConfigured() || !db) {
    return {
      ok: false,
      error:
        'Firebase no está conectado: completá `.env.local` con las claves web (incluido NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET si subís fotos). Reiniciá el servidor de desarrollo tras guardar.',
      filesUploaded: false,
    };
  }

  const vis = getMachineFieldVisibility({
    tipoMaquinaria: state.tipoMaquinaria,
    condicion: state.condicion,
  });

  const clientFolder = randomClientFolder();
  let folletoUrl: string | null = null;
  let imagenesUrls: string[] = [];
  let storageWarning: string | undefined;
  let filesUploaded = false;

  const wantsFiles = Boolean(state.folleto || state.imagenes.length > 0);

  if (wantsFiles) {
    const up = await uploadVenderFiles(clientFolder, state);
    folletoUrl = up.folletoUrl;
    imagenesUrls = up.imagenesUrls;
    if (up.error) {
      storageWarning = up.error;
    }
    filesUploaded = Boolean(folletoUrl || imagenesUrls.length > 0);
  }

  const adjuntosUrls = [
    ...(folletoUrl ? [folletoUrl] : []),
    ...imagenesUrls,
  ];

  const docPayload = {
    source: 'web-vender',
    clientFolder,
    createdAt: Timestamp.now(),
    tipoMaquinaria: state.tipoMaquinaria,
    tipoOtrosDescripcion: vis.tipoOtros ? state.tipoOtrosDescripcion.trim() || null : null,
    condicion: state.condicion,
    horas: vis.horas ? parseNum(state.horas) ?? null : null,
    marca: state.marca.trim(),
    modelo: state.modelo.trim(),
    ano: parseNum(state.ano) ?? null,
    precio: state.precio.trim(),
    moneda: state.moneda,
    pesoTotalKg: vis.pesoTotalKg ? parseNum(state.pesoTotalKg) ?? null : null,
    capacidadBaldeM3: vis.capacidadBaldeM3 ? parseNum(state.capacidadBaldeM3) ?? null : null,
    descripcionMaquina: state.descripcionMaquina.trim() || null,
    nombreApellido: state.nombreApellido.trim(),
    email: state.email.trim(),
    celular: state.celular.trim(),
    ubicacion: state.ubicacion.trim(),
    mensajeAdicional: state.mensajeAdicional.trim() || null,
    folletoUrl,
    imagenesUrls,
    adjuntosUrls: adjuntosUrls.length ? adjuntosUrls : null,
  };

  try {
    const refDoc = await addDoc(collection(db, VENDER_LEADS_COLLECTION), docPayload);
    let finalStorageWarning = storageWarning;
    if (wantsFiles && !filesUploaded && !finalStorageWarning) {
      finalStorageWarning =
        'No se pudieron subir los archivos. Revisá reglas de Storage y NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET en .env.local.';
    }
    return {
      ok: true,
      leadId: refDoc.id,
      filesUploaded,
      storageWarning: finalStorageWarning,
    };
  } catch (e) {
    return {
      ok: false,
      error: formatFirebaseError(e, 'No se pudo guardar la consulta en Firestore'),
      filesUploaded,
      storageWarning,
    };
  }
}
