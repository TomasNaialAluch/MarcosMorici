/** Lead «quiero vender» — alineado al formulario Vialmaq / README_VENDER_VIALMAQ.md */

export type TipoMaquinaria =
  | 'retroexcavadoras'
  | 'compactacion'
  | 'motoniveladoras'
  | 'cargadoras'
  | 'minicargadoras'
  | 'topadoras'
  | 'miniexcavadoras'
  | 'otros';

export type CondicionMaquina = 'nuevo' | 'usado';

export type MonedaLead = 'pesos' | 'dolar';

export interface VenderFormState {
  step: 0 | 1;
  tipoMaquinaria: TipoMaquinaria;
  tipoOtrosDescripcion: string;
  condicion: CondicionMaquina;
  horas: string;
  marca: string;
  modelo: string;
  ano: string;
  precio: string;
  moneda: MonedaLead;
  pesoTotalKg: string;
  capacidadBaldeM3: string;
  descripcionMaquina: string;
  folleto: File | null;
  imagenes: File[];
  nombreApellido: string;
  email: string;
  celular: string;
  ubicacion: string;
  mensajeAdicional: string;
}

export type VenderFormErrors = Partial<Record<keyof VenderFormState, string>>;
