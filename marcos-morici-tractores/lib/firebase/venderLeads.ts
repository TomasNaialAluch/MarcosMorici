import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import type { VenderFormState } from '@/lib/types/venderLead';
import { VENDER_LEADS_COLLECTION } from '@/lib/vender/constants';
import { getMachineFieldVisibility } from '@/lib/vender/fieldVisibility';

export interface PersistLeadResult {
  ok: boolean;
  leadId?: string;
  error?: string;
  filesUploaded: boolean;
}

async function uploadOptionalFiles(clientFolder: string, state: VenderFormState): Promise<string[]> {
  if (!storage) return [];
  const urls: string[] = [];
  const base = `vender_leads/${clientFolder}`;

  if (state.folleto) {
    const r = ref(storage, `${base}/folleto_${Date.now()}_${state.folleto.name}`);
    await uploadBytes(r, state.folleto);
    urls.push(await getDownloadURL(r));
  }

  for (let i = 0; i < state.imagenes.length; i++) {
    const file = state.imagenes[i];
    const r = ref(storage, `${base}/img_${Date.now()}_${i}_${file.name}`);
    await uploadBytes(r, file);
    urls.push(await getDownloadURL(r));
  }

  return urls;
}

function parseNum(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Guarda el lead en Firestore y, si hay Storage configurado, intenta subir adjuntos.
 * Requiere reglas que permitan escritura en `venderLeads` y en `vender_leads/{id}/**` según tu proyecto.
 */
export async function persistVenderLead(state: VenderFormState): Promise<PersistLeadResult> {
  if (!db) {
    return { ok: false, error: 'Firebase no está configurado.', filesUploaded: false };
  }

  const vis = getMachineFieldVisibility({
    tipoMaquinaria: state.tipoMaquinaria,
    condicion: state.condicion,
  });

  const clientFolder = crypto.randomUUID();
  let fileUrls: string[] = [];
  let filesUploaded = false;

  if (storage && (state.folleto || state.imagenes.length > 0)) {
    try {
      fileUrls = await uploadOptionalFiles(clientFolder, state);
      filesUploaded = fileUrls.length > 0;
    } catch {
      /* continúa sin URLs: el mensaje por WhatsApp puede llevar las fotos */
    }
  }

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
    adjuntosUrls: fileUrls.length ? fileUrls : null,
  };

  try {
    const refDoc = await addDoc(collection(db, VENDER_LEADS_COLLECTION), docPayload);
    return { ok: true, leadId: refDoc.id, filesUploaded };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al guardar.';
    return { ok: false, error: msg, filesUploaded };
  }
}
