import type { VenderFormState, VenderFormErrors } from '@/lib/types/venderLead';
import { getMachineFieldVisibility } from '@/lib/vender/fieldVisibility';
import { VENDER_FILE_EXTENSIONS } from '@/lib/vender/constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePositiveInt(raw: string, label: string): { ok: true; n: number } | { ok: false; msg: string } {
  const t = raw.trim();
  if (!t) return { ok: false, msg: `Completá ${label}.` };
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return { ok: false, msg: `${label} inválido.` };
  if (!Number.isInteger(n)) return { ok: false, msg: `${label} debe ser un número entero.` };
  return { ok: true, n };
}

function parseOptionalNumber(raw: string, label: string): { ok: true; n: number } | { ok: false; msg: string } {
  const t = raw.trim();
  if (!t) return { ok: false, msg: `Completá ${label}.` };
  const n = Number(t.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return { ok: false, msg: `${label} inválido.` };
  return { ok: true, n };
}

function fileExtensionOk(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return (VENDER_FILE_EXTENSIONS as readonly string[]).includes(ext);
}

export function validateVenderFiles(folleto: File | null, imagenes: File[]): string | null {
  if (folleto && !fileExtensionOk(folleto.name)) {
    return 'El folleto debe ser PDF u otro formato permitido.';
  }
  for (const f of imagenes) {
    if (!fileExtensionOk(f.name)) {
      return `Archivo no permitido: ${f.name}`;
    }
  }
  return null;
}

export function validateStepMachine(state: VenderFormState): VenderFormErrors {
  const errors: VenderFormErrors = {};
  const vis = getMachineFieldVisibility({
    tipoMaquinaria: state.tipoMaquinaria,
    condicion: state.condicion,
  });

  if (vis.tipoOtros) {
    if (!state.tipoOtrosDescripcion.trim()) {
      errors.tipoOtrosDescripcion = 'Indicá el tipo de maquinaria.';
    }
  }

  if (vis.horas) {
    const h = parsePositiveInt(state.horas, 'las horas de uso');
    if (!h.ok) errors.horas = h.msg;
    else if (h.n === 0) errors.horas = 'Las horas deben ser mayores a 0.';
  }

  if (!state.marca.trim()) errors.marca = 'Completá la marca.';
  if (!state.modelo.trim()) errors.modelo = 'Completá el modelo.';

  const ano = parsePositiveInt(state.ano, 'el año');
  if (!ano.ok) errors.ano = ano.msg;
  else if (ano.n < 1950 || ano.n > new Date().getFullYear() + 1) {
    errors.ano = 'Año fuera de rango razonable.';
  }

  if (!state.precio.trim()) errors.precio = 'Completá el precio.';

  if (vis.pesoTotalKg) {
    const p = parseOptionalNumber(state.pesoTotalKg, 'el peso total (kg)');
    if (!p.ok) errors.pesoTotalKg = p.msg;
  }

  if (vis.capacidadBaldeM3) {
    const c = parseOptionalNumber(state.capacidadBaldeM3, 'la capacidad de balde (m³)');
    if (!c.ok) errors.capacidadBaldeM3 = c.msg;
  }

  return errors;
}

export function validateStepContact(state: VenderFormState): VenderFormErrors {
  const errors: VenderFormErrors = {};
  if (!state.nombreApellido.trim()) errors.nombreApellido = 'Completá nombre y apellido.';
  if (!state.email.trim()) errors.email = 'Completá el correo.';
  else if (!EMAIL_RE.test(state.email.trim())) errors.email = 'Correo electrónico inválido.';
  if (!state.celular.trim()) errors.celular = 'Completá el celular.';
  if (!state.ubicacion.trim()) errors.ubicacion = 'Completá la ubicación de la máquina.';
  return errors;
}

export function validateFullForm(state: VenderFormState): VenderFormErrors {
  return { ...validateStepMachine(state), ...validateStepContact(state) };
}
