import type { VenderSimpleFormState } from '@/lib/types/venderSolicitud';

export function createInitialSimpleFormState(): VenderSimpleFormState {
  return {
    marca: '',
    modelo: '',
    descripcion: '',
    folleto: null,
    imagenes: [],
    precio: '',
    precioConsultar: false,
    moneda: 'pesos',
    nombreApellido: '',
    email: '',
    celular: '',
    ubicacion: '',
  };
}
