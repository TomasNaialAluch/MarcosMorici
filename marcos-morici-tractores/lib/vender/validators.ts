import type { VenderFormState, VenderFormErrors } from '@/lib/types/venderLead';
import type { VenderSimpleFormState, VenderSimpleFormErrors } from '@/lib/types/venderSolicitud';
import { VENDER_FILE_EXTENSIONS } from '@/lib/vender/constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fileExtensionOk(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return (VENDER_FILE_EXTENSIONS as readonly string[]).includes(ext);
}

/** Solo formato de adjuntos; no exige que haya archivos. */
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

/** Paso contacto: si completan el correo, debe ser válido. */
export function validateStepContact(state: VenderFormState): VenderFormErrors {
  const errors: VenderFormErrors = {};
  const em = state.email.trim();
  if (em && !EMAIL_RE.test(em)) {
    errors.email = 'Si ingresás un correo, tiene que tener un formato válido.';
  }
  return errors;
}

export function validateFullForm(state: VenderFormState): VenderFormErrors {
  return validateStepContact(state);
}

/** Validación del formulario corto (usuarios no admin). */
export function validateSimpleSolicitud(state: VenderSimpleFormState): VenderSimpleFormErrors {
  const errors: VenderSimpleFormErrors = {};
  if (!state.marca.trim()) errors.marca = 'Indicá la marca.';
  if (!state.modelo.trim()) errors.modelo = 'Indicá el modelo.';
  if (!state.descripcion.trim()) errors.descripcion = 'Agregá una descripción.';
  if (state.imagenes.length < 1) errors.imagenes = 'Subí al menos una foto.';
  if (!state.precioConsultar && !state.precio.trim()) {
    errors.precio = 'Indicá el precio o marcá «Precio a consultar».';
  }
  if (!state.celular.trim()) errors.celular = 'Indicá un número de celular para contactarte.';
  const em = state.email.trim();
  if (em && !EMAIL_RE.test(em)) {
    errors.email = 'Correo inválido.';
  }
  return errors;
}
