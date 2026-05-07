/** Lead «quiero vender» — alineado al formulario Vialmaq / README_VENDER_VIALMAQ.md */

export type TipoMaquinaria =
  | ''
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
  /** Título comercial en ficha (opcional). */
  titulo: string;
  /** Categoría alineada al catálogo «Comprar» (misma lista que publicaciones). */
  categoria: string;
  /** Código / SKU interno (opcional). */
  sku: string;
  ano: string;
  precio: string;
  /** Si está marcado, no hace falta importe en «Precio». */
  precioConsultar: boolean;
  moneda: MonedaLead;
  pesoTotalKg: string;
  capacidadBaldeM3: string;
  descripcionMaquina: string;
  folleto: File | null;
  /** URL del folleto PDF (alternativa o complemento al archivo). */
  folletoUrl: string;
  imagenes: File[];
  nombreApellido: string;
  email: string;
  celular: string;
  ubicacion: string;
  mensajeAdicional: string;
}

export type VenderFormErrors = Partial<Record<keyof VenderFormState, string>>;
