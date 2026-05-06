import {
  collection,
  getDocs,
  query,
  where,
  limit,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Equipo } from '@/lib/types/equipo';

const COLLECTION = 'equipos';

function toDate(value: unknown): Date | null {
  if (!value || typeof value !== 'object') return null;
  if ('toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  return null;
}

function slugify(part: string): string {
  return part
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildSlug(marca: string, modelo: string, id: string): string {
  const base = slugify(`${marca}-${modelo}`);
  return base ? `${base}-${id.slice(0, 8)}` : id;
}

export function equipoFromDoc(id: string, data: DocumentData): Equipo {
  const marca = String(data.marca ?? '').trim() || 'Sin marca';
  const modelo = String(data.modelo ?? '').trim() || 'Sin modelo';
  const tituloRaw = String(data.titulo ?? '').trim();
  const titulo = tituloRaw || `${marca} ${modelo}`.trim();

  let imagenes: string[] = [];
  if (Array.isArray(data.imagenes)) {
    imagenes = data.imagenes.filter((u): u is string => typeof u === 'string' && u.length > 0);
  } else if (typeof data.imagen === 'string' && data.imagen) {
    imagenes = [data.imagen];
  }

  const slugRaw = String(data.slug ?? '').trim();
  const slug = slugRaw || buildSlug(marca, modelo, id);

  const precioNum =
    typeof data.precio === 'number'
      ? data.precio
      : typeof data.precioUsd === 'number'
        ? data.precioUsd
        : undefined;

  const ano =
    typeof data.ano === 'number'
      ? data.ano
      : typeof data.year === 'number'
        ? data.year
        : undefined;

  return {
    id,
    titulo,
    marca,
    modelo,
    ano,
    horas: typeof data.horas === 'number' ? data.horas : undefined,
    precio: precioNum,
    precioConsultar: Boolean(data.precioConsultar),
    descripcion: typeof data.descripcion === 'string' ? data.descripcion : undefined,
    imagenes,
    createdAt: toDate(data.createdAt),
    publicado: data.publicado !== false,
    slug,
    categoria:
      typeof data.categoria === 'string'
        ? data.categoria
        : typeof data.tipoEquipo === 'string'
          ? data.tipoEquipo
          : undefined,
    destacado: Boolean(data.destacado),
    capacidadBaldeM3:
      typeof data.capacidadBaldeM3 === 'number' ? data.capacidadBaldeM3 : undefined,
    pesoTotalKg: typeof data.pesoTotalKg === 'number' ? data.pesoTotalKg : undefined,
    folletoPdfUrl: pickPdfUrl(data),
  };
}

function pickPdfUrl(data: DocumentData): string | undefined {
  const keys = ['folletoPdfUrl', 'pdfUrl', 'documentoPdf', 'folletoUrl', 'fichaPdfUrl'] as const;
  for (const k of keys) {
    const v = data[k];
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

/** Todos los equipos publicados (catálogo cliente). */
export async function fetchEquiposPublicados(): Promise<Equipo[]> {
  if (!db) return [];

  const ref = collection(db, COLLECTION);
  const qPublished = query(ref, where('publicado', '==', true));
  let snap;
  try {
    snap = await getDocs(qPublished);
  } catch {
    snap = await getDocs(ref);
  }

  const list: Equipo[] = [];
  snap.forEach((docSnap) => {
    const e = equipoFromDoc(docSnap.id, docSnap.data());
    if (e.publicado !== false) list.push(e);
  });
  return list;
}

export async function fetchEquipoPorSlug(slug: string): Promise<Equipo | null> {
  const all = await fetchEquiposPublicados();
  const e = all.find((x) => x.slug === slug) ?? null;
  if (e && e.publicado === false) return null;
  return e;
}

/** Evita traer colecciones enormes sin límite en detalle. */
export async function fetchEquipoPorSlugQuery(slug: string): Promise<Equipo | null> {
  if (!db) return null;

  const ref = collection(db, COLLECTION);
  const qSlug = query(ref, where('slug', '==', slug), limit(1));
  try {
    const snap = await getDocs(qSlug);
    if (snap.empty) return fetchEquipoPorSlug(slug);
    const d = snap.docs[0];
    const e = equipoFromDoc(d.id, d.data());
    if (e.publicado === false) return null;
    return e;
  } catch {
    return fetchEquipoPorSlug(slug);
  }
}
