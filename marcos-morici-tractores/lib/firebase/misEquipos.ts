import { FirebaseError } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { buildSlug, equipoFromDoc } from '@/lib/firebase/equipos';
import { db, storage } from '@/lib/firebase/config';
import type { Equipo } from '@/lib/types/equipo';

const COLLECTION = 'equipos';

export type MisEquipoInput = {
  marca: string;
  modelo: string;
  titulo?: string;
  ano?: number;
  horas?: number;
  precio?: number;
  precioConsultar: boolean;
  descripcion?: string;
  categoria?: string;
  publicado: boolean;
  imagenes: string[];
};

function formatErr(e: unknown, fallback: string): string {
  if (e instanceof FirebaseError) {
    if (e.code === 'permission-denied') return `${fallback} (permission-denied).`;
    return `${e.message} (${e.code})`;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

async function uploadImagesForEquipo(ownerUid: string, equipoId: string, files: File[]): Promise<string[]> {
  if (!storage || files.length === 0) return [];
  const urls: string[] = [];
  const base = `user_equipos/${ownerUid}/${equipoId}`;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    const r = ref(storage, `${base}/img_${Date.now()}_${i}_${safe}`);
    await uploadBytes(r, file, { contentType: file.type || undefined });
    urls.push(await getDownloadURL(r));
  }
  return urls;
}

export async function fetchMisEquipos(ownerUid: string): Promise<Equipo[]> {
  if (!db) return [];
  const q = query(collection(db, COLLECTION), where('ownerId', '==', ownerUid));
  const snap = await getDocs(q);
  const list: Equipo[] = [];
  snap.forEach((d) => list.push(equipoFromDoc(d.id, d.data())));
  list.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  return list;
}

export async function fetchMisEquipoById(equipoId: string, ownerUid: string): Promise<Equipo | null> {
  if (!db) return null;
  const refDoc = doc(db, COLLECTION, equipoId);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.ownerId !== ownerUid) return null;
  return equipoFromDoc(snap.id, data);
}

export async function createMisEquipo(
  ownerUid: string,
  input: MisEquipoInput,
  imageFiles: File[]
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no está disponible.' };
  const marca = input.marca.trim() || 'Sin marca';
  const modelo = input.modelo.trim() || 'Sin modelo';
  const refDoc = doc(collection(db, COLLECTION));
  const id = refDoc.id;
  const slug = buildSlug(marca, modelo, id);
  const titulo = (input.titulo?.trim() || `${marca} ${modelo}`).trim();

  const basePayload = {
    ownerId: ownerUid,
    marca,
    modelo,
    titulo,
    slug,
    ano: typeof input.ano === 'number' && Number.isFinite(input.ano) ? input.ano : null,
    horas: typeof input.horas === 'number' && Number.isFinite(input.horas) ? input.horas : null,
    precio: typeof input.precio === 'number' && Number.isFinite(input.precio) ? input.precio : null,
    precioConsultar: Boolean(input.precioConsultar),
    descripcion: input.descripcion?.trim() || null,
    categoria: input.categoria?.trim() || null,
    publicado: Boolean(input.publicado),
    imagenes: [...input.imagenes.filter((u) => typeof u === 'string' && u.trim())],
    destacado: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(refDoc, basePayload);
    const uploaded = await uploadImagesForEquipo(ownerUid, id, imageFiles);
    if (uploaded.length > 0) {
      await updateDoc(refDoc, {
        imagenes: [...basePayload.imagenes, ...uploaded],
        updatedAt: serverTimestamp(),
      });
    }
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: formatErr(e, 'No se pudo crear la publicación') };
  }
}

export async function updateMisEquipo(
  ownerUid: string,
  equipoId: string,
  input: MisEquipoInput,
  newImageFiles: File[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no está disponible.' };
  const refDoc = doc(db, COLLECTION, equipoId);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return { ok: false, error: 'Equipo no encontrado.' };
  if (snap.data().ownerId !== ownerUid) return { ok: false, error: 'No tenés permiso para editar este equipo.' };

  const marca = input.marca.trim() || 'Sin marca';
  const modelo = input.modelo.trim() || 'Sin modelo';
  const slug = buildSlug(marca, modelo, equipoId);
  const titulo = (input.titulo?.trim() || `${marca} ${modelo}`).trim();

  let imagenes = [...input.imagenes.filter((u) => typeof u === 'string' && u.trim())];
  try {
    const uploaded = await uploadImagesForEquipo(ownerUid, equipoId, newImageFiles);
    imagenes = [...imagenes, ...uploaded];
    await updateDoc(refDoc, {
      marca,
      modelo,
      titulo,
      slug,
      ano: typeof input.ano === 'number' && Number.isFinite(input.ano) ? input.ano : null,
      horas: typeof input.horas === 'number' && Number.isFinite(input.horas) ? input.horas : null,
      precio: typeof input.precio === 'number' && Number.isFinite(input.precio) ? input.precio : null,
      precioConsultar: Boolean(input.precioConsultar),
      descripcion: input.descripcion?.trim() || null,
      categoria: input.categoria?.trim() || null,
      publicado: Boolean(input.publicado),
      imagenes,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatErr(e, 'No se pudo actualizar') };
  }
}

export async function deleteMisEquipo(
  ownerUid: string,
  equipoId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!db) return { ok: false, error: 'Firestore no está disponible.' };
  const refDoc = doc(db, COLLECTION, equipoId);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return { ok: false, error: 'Equipo no encontrado.' };
  if (snap.data().ownerId !== ownerUid) return { ok: false, error: 'No tenés permiso para eliminar este equipo.' };
  try {
    await deleteDoc(refDoc);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatErr(e, 'No se pudo eliminar') };
  }
}
