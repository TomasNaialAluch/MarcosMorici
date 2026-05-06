import type { TipoMaquinaria, CondicionMaquina } from '@/lib/types/venderLead';

export interface MachineFieldVisibility {
  tipoOtros: boolean;
  horas: boolean;
  pesoTotalKg: boolean;
  capacidadBaldeM3: boolean;
}

/**
 * Reglas condicionales README §7 / Vialmaq Amasty.
 * - Otros → texto tipo libre.
 * - Usado → horas obligatorias.
 * - Retroexcavadoras | Miniexcavadoras → peso total.
 * - Cargadoras → capacidad de balde.
 */
export function getMachineFieldVisibility(params: {
  tipoMaquinaria: TipoMaquinaria;
  condicion: CondicionMaquina;
}): MachineFieldVisibility {
  const { tipoMaquinaria, condicion } = params;
  return {
    tipoOtros: tipoMaquinaria === 'otros',
    horas: condicion === 'usado',
    pesoTotalKg: tipoMaquinaria === 'retroexcavadoras' || tipoMaquinaria === 'miniexcavadoras',
    capacidadBaldeM3: tipoMaquinaria === 'cargadoras',
  };
}
