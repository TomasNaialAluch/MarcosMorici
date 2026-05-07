import type { MonedaLead } from '@/lib/types/venderLead';

export type SolicitudStatus = 'pending' | 'published' | 'rejected';

/** Formulario corto «quiero vender» (usuarios no admin). */
export interface VenderSimpleFormState {
  marca: string;
  modelo: string;
  descripcion: string;
  folleto: File | null;
  imagenes: File[];
  precio: string;
  precioConsultar: boolean;
  moneda: MonedaLead;
  nombreApellido: string;
  email: string;
  celular: string;
  ubicacion: string;
}

export type VenderSimpleFormErrors = Partial<Record<keyof VenderSimpleFormState, string>>;
