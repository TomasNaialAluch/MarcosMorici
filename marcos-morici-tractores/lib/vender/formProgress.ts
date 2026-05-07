import type { VenderFormState } from '@/lib/types/venderLead';

export interface VenderProgressGroup {
  id: string;
  label: string;
  filled: number;
  total: number;
}

function n(v: string): number {
  return v.trim().length > 0 ? 1 : 0;
}

/** Feedback visual: subcampos completados por bloque (ningún campo es obligatorio). */
export function computeVenderFormProgress(state: VenderFormState): {
  groups: VenderProgressGroup[];
  percent: number;
} {
  const tipo = state.tipoMaquinaria;
  const tipoOk = tipo !== '';

  let g2filled = 0;
  let g2total = 1;
  if (!tipoOk) {
    g2filled = 0;
    g2total = 1;
  } else if (tipo === 'otros') {
    g2filled = 1 + n(state.tipoOtrosDescripcion);
    g2total = 2;
  } else {
    g2filled = 1;
    g2total = 1;
  }

  const g1: VenderProgressGroup = {
    id: 'identificacion',
    label: 'Identificación',
    filled: n(state.marca) + n(state.modelo) + n(state.titulo) + n(state.categoria) + n(state.sku),
    total: 5,
  };

  const g2: VenderProgressGroup = {
    id: 'clasificacion',
    label: 'Tipo de maquinaria',
    filled: g2filled,
    total: g2total,
  };

  const g3: VenderProgressGroup = {
    id: 'uso',
    label: 'Año y horas de uso',
    filled: n(state.ano) + n(state.horas),
    total: 2,
  };

  const precioOk = state.precioConsultar || n(state.precio) > 0;
  const g4: VenderProgressGroup = {
    id: 'precio',
    label: 'Precio',
    filled: precioOk ? 1 : 0,
    total: 1,
  };

  const g5: VenderProgressGroup = {
    id: 'ficha',
    label: 'Ficha técnica y descripción',
    filled: n(state.pesoTotalKg) + n(state.capacidadBaldeM3) + n(state.descripcionMaquina),
    total: 3,
  };

  const folletoOk = Boolean(state.folleto) || n(state.folletoUrl) > 0;
  const g6: VenderProgressGroup = {
    id: 'archivos',
    label: 'Folleto e imágenes',
    filled: (folletoOk ? 1 : 0) + (state.imagenes.length > 0 ? 1 : 0),
    total: 2,
  };

  const g7: VenderProgressGroup = {
    id: 'contacto',
    label: 'Contacto',
    filled:
      n(state.nombreApellido) +
      n(state.email) +
      n(state.celular) +
      n(state.ubicacion) +
      n(state.mensajeAdicional),
    total: 5,
  };

  const groups = [g1, g2, g3, g4, g5, g6, g7];
  const sumFilled = groups.reduce((a, g) => a + Math.min(g.filled, g.total), 0);
  const sumTotal = groups.reduce((a, g) => a + g.total, 0);
  const percent = sumTotal > 0 ? Math.min(100, Math.round((sumFilled / sumTotal) * 100)) : 0;

  return { groups, percent };
}
