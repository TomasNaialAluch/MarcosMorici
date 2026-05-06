import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const EQUIPO_CONTACTOS_COLLECTION = 'equipoContactos';

export type EquipoContactoTipo = 'consulta' | 'oferta' | 'chat_sesion';

export interface EquipoConsultaPayload {
  tipo: 'consulta';
  equipoId: string;
  slug: string;
  tituloSnapshot: string;
  nombre: string;
  email: string;
  mensaje: string;
}

export interface EquipoOfertaPayload {
  tipo: 'oferta';
  equipoId: string;
  slug: string;
  tituloSnapshot: string;
  nombre: string;
  email: string;
  telefono: string;
  montoOfertaUsd: number;
  mensaje?: string;
}

export interface EquipoChatSesionPayload {
  tipo: 'chat_sesion';
  equipoId: string;
  slug: string;
  tituloSnapshot: string;
  transcript: string;
}

export type EquipoContactoPayload = EquipoConsultaPayload | EquipoOfertaPayload | EquipoChatSesionPayload;

export interface PersistEquipoContactoResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function persistEquipoContacto(payload: EquipoContactoPayload): Promise<PersistEquipoContactoResult> {
  if (!db) {
    return { ok: false, error: 'Firebase no está configurado.' };
  }
  try {
    const ref = await addDoc(collection(db, EQUIPO_CONTACTOS_COLLECTION), {
      ...payload,
      createdAt: Timestamp.now(),
      source: 'web-detalle-equipo',
    });
    return { ok: true, id: ref.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al guardar.' };
  }
}
