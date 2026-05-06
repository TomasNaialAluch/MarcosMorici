import type { VenderFormState } from '@/lib/types/venderLead';

export function createInitialVenderFormState(): VenderFormState {
  return {
    step: 0,
    tipoMaquinaria: 'retroexcavadoras',
    tipoOtrosDescripcion: '',
    condicion: 'nuevo',
    horas: '',
    marca: '',
    modelo: '',
    ano: '',
    precio: '',
    moneda: 'pesos',
    pesoTotalKg: '',
    capacidadBaldeM3: '',
    descripcionMaquina: '',
    folleto: null,
    imagenes: [],
    nombreApellido: '',
    email: '',
    celular: '',
    ubicacion: '',
    mensajeAdicional: '',
  };
}
