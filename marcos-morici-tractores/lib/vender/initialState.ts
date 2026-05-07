import type { VenderFormState } from '@/lib/types/venderLead';

export function createInitialVenderFormState(): VenderFormState {
  return {
    step: 0,
    tipoMaquinaria: '',
    tipoOtrosDescripcion: '',
    condicion: 'nuevo',
    horas: '',
    marca: '',
    modelo: '',
    titulo: '',
    categoria: '',
    sku: '',
    ano: '',
    precio: '',
    precioConsultar: false,
    moneda: 'pesos',
    pesoTotalKg: '',
    capacidadBaldeM3: '',
    descripcionMaquina: '',
    folleto: null,
    folletoUrl: '',
    imagenes: [],
    nombreApellido: '',
    email: '',
    celular: '',
    ubicacion: '',
    mensajeAdicional: '',
  };
}
