/** Alineado al formulario Vender / leads (`moneda`). */
export type EquipoMoneda = 'pesos' | 'dolar';

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
  /** Si no se define, se asume USD al formatear precio (catálogo histórico). */
  moneda?: EquipoMoneda;
  descripcion?: string;
  imagenes: string[];
  createdAt: Date | null;
  publicado: boolean;
  slug: string;
  categoria?: string;
  destacado?: boolean;
  capacidadBaldeM3?: number;
  pesoTotalKg?: number;
  /** SKU / código interno (Firestore: `sku`, `codigo`, etc.). */
  sku?: string;
  /** Nuevo o usado (formulario Vender). */
  condicion?: 'nuevo' | 'usado';
  /**
   * Clave de tipo de maquinaria (mismo set que Vender) o texto libre si migraste distinto.
   * Firestore: `tipoMaquinaria`.
   */
  tipoMaquinaria?: string;
  /** Si `tipoMaquinaria` es `otros`. */
  tipoOtrosDescripcion?: string;
  /** URL pública del folleto / ficha PDF (Storage u otro HTTPS). Alias en Firestore: `pdfUrl`, `documentoPdf`, `folletoUrl`, `folletoUrlIngresada`. */
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
