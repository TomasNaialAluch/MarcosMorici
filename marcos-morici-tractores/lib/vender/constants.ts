import type { TipoMaquinaria } from '@/lib/types/venderLead';

/** Títulos de pasos (README §4.2 / Vialmaq). */
export const VENDER_STEP_TITLES = ['Sobre la máquina', 'Datos de contacto'] as const;

export const TIPO_MAQUINARIA_OPTIONS: { value: TipoMaquinaria; label: string }[] = [
  { value: 'retroexcavadoras', label: 'Retroexcavadoras' },
  { value: 'compactacion', label: 'Equipos de compactación' },
  { value: 'motoniveladoras', label: 'Motoniveladoras' },
  { value: 'cargadoras', label: 'Cargadoras' },
  { value: 'minicargadoras', label: 'Minicargadoras' },
  { value: 'topadoras', label: 'Topadoras' },
  { value: 'miniexcavadoras', label: 'Miniexcavadoras' },
  { value: 'otros', label: 'Otros' },
];

export const CONDICION_OPTIONS = [
  { value: 'nuevo' as const, label: 'Nuevo' },
  { value: 'usado' as const, label: 'Usado' },
];

export const MONEDA_OPTIONS = [
  { value: 'pesos' as const, label: 'Peso argentino' },
  { value: 'dolar' as const, label: 'Dólar' },
];

/** Extensiones permitidas en referencia Vialmaq (README §6.1). */
export const VENDER_FILE_EXTENSIONS = [
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'gif',
  'bmp',
  'png',
  'jpg',
  'jpeg',
  'pdf',
  'txt',
] as const;

export const VENDER_FILE_ACCEPT = VENDER_FILE_EXTENSIONS.map((e) => `.${e}`).join(',');

export const VENDER_LEADS_COLLECTION = 'venderLeads';
