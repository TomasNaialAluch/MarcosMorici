/** Modelo de equipo (Firestore + UI). Campos opcionales toleran documentos incompletos. */
export interface Equipo {
  id: string;
  titulo: string;
  marca: string;
  modelo: string;
  ano?: number;
  horas?: number;
  precio?: number;
  precioConsultar?: boolean;
  descripcion?: string;
  imagenes: string[];
  createdAt: Date | null;
  publicado: boolean;
  slug: string;
  categoria?: string;
  destacado?: boolean;
  capacidadBaldeM3?: number;
  pesoTotalKg?: number;
  /** URL pública del folleto / ficha PDF (Storage u otro HTTPS). Alias en Firestore: `pdfUrl`, `documentoPdf`, `folletoUrl`. */
  folletoPdfUrl?: string;
  /** UID de Firebase Auth del usuario que publicó (equipos cargados desde cuenta). */
  ownerId?: string;
}

export type SortOption =
  | 'destacados'
  | 'precioAsc'
  | 'precioDesc'
  | 'anoDesc'
  | 'anoAsc'
  | 'horasAsc'
  | 'recientes';
