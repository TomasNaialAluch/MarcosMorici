import type { VenderFormState } from '@/lib/types/venderLead';
import { TIPO_MAQUINARIA_OPTIONS, MONEDA_OPTIONS } from '@/lib/vender/constants';
import { getMachineFieldVisibility } from '@/lib/vender/fieldVisibility';

function labelTipo(value: VenderFormState['tipoMaquinaria']): string {
  if (value === '') return '(no indicado)';
  return TIPO_MAQUINARIA_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function labelMoneda(value: VenderFormState['moneda']): string {
  return MONEDA_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** Mensaje legible para WhatsApp si no hay persistencia o como copia para el usuario. */
export function buildLeadWhatsappMessage(state: VenderFormState): string {
  const vis = getMachineFieldVisibility({
    tipoMaquinaria: state.tipoMaquinaria,
    condicion: state.condicion,
  });

  const lines: string[] = [
    '*Consulta por venta de maquinaria*',
    '',
    `*Tipo:* ${labelTipo(state.tipoMaquinaria)}`,
  ];
  if (vis.tipoOtros && state.tipoOtrosDescripcion.trim()) {
    lines.push(`*Detalle tipo:* ${state.tipoOtrosDescripcion.trim()}`);
  }
  lines.push(`*Condición:* ${state.condicion === 'nuevo' ? 'Nuevo' : 'Usado'}`);
  if (vis.horas && state.horas.trim()) lines.push(`*Horas:* ${state.horas.trim()} hs.`);
  const mm = `${state.marca.trim()} ${state.modelo.trim()}`.trim();
  if (mm) lines.push(`*Marca / modelo:* ${mm}`);
  if (state.titulo.trim()) lines.push(`*Título:* ${state.titulo.trim()}`);
  if (state.categoria.trim()) lines.push(`*Categoría catálogo:* ${state.categoria.trim()}`);
  if (state.sku.trim()) lines.push(`*SKU / código:* ${state.sku.trim()}`);
  if (state.ano.trim()) lines.push(`*Año:* ${state.ano.trim()}`);
  if (state.precioConsultar) {
    lines.push('*Precio:* A consultar');
  } else if (state.precio.trim()) {
    lines.push(`*Precio:* ${state.precio.trim()} (${labelMoneda(state.moneda)})`);
  } else {
    lines.push('*Precio:* (no indicado)');
  }
  if (vis.pesoTotalKg && state.pesoTotalKg.trim()) lines.push(`*Peso total:* ${state.pesoTotalKg.trim()} kg`);
  if (vis.capacidadBaldeM3 && state.capacidadBaldeM3.trim()) {
    lines.push(`*Balde:* ${state.capacidadBaldeM3.trim()} m³`);
  }
  if (state.descripcionMaquina.trim()) {
    lines.push(`*Descripción:* ${state.descripcionMaquina.trim()}`);
  }
  if (state.folletoUrl.trim()) {
    lines.push(`*Folleto (URL):* ${state.folletoUrl.trim()}`);
  }
  lines.push('', '*Contacto*');
  if (state.nombreApellido.trim()) lines.push(`*Nombre:* ${state.nombreApellido.trim()}`);
  if (state.email.trim()) lines.push(`*Email:* ${state.email.trim()}`);
  if (state.celular.trim()) lines.push(`*Celular:* ${state.celular.trim()}`);
  if (state.ubicacion.trim()) lines.push(`*Ubicación máquina:* ${state.ubicacion.trim()}`);
  if (state.mensajeAdicional.trim()) {
    lines.push(`*Mensaje:* ${state.mensajeAdicional.trim()}`);
  }
  const fileBits: string[] = [];
  if (state.folleto) fileBits.push(`Folleto: ${state.folleto.name}`);
  if (state.imagenes.length) fileBits.push(`${state.imagenes.length} imagen(es) adjuntas en el formulario web`);
  if (fileBits.length) {
    lines.push('', '*Archivos*', ...fileBits);
  }
  return lines.join('\n');
}
