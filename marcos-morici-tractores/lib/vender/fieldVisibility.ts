import type { TipoMaquinaria, CondicionMaquina } from '@/lib/types/venderLead';

export interface MachineFieldVisibility {
  tipoOtros: boolean;
  horas: boolean;
  pesoTotalKg: boolean;
  capacidadBaldeM3: boolean;
}

/**
 * Visibilidad de campos en «Vender». Todo es opcional; mostramos siempre horas, peso y balde
 * para poder cargar la ficha completa sin reglas rígidas. Solo «Otros» despliega texto libre.
 */
export function getMachineFieldVisibility(params: {
  tipoMaquinaria: TipoMaquinaria;
  condicion: CondicionMaquina;
}): MachineFieldVisibility {
  const { tipoMaquinaria } = params;
  return {
    tipoOtros: tipoMaquinaria === 'otros',
    horas: true,
    pesoTotalKg: true,
    capacidadBaldeM3: true,
  };
}
