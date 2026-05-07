import type { VenderFormState, VenderFormErrors } from '@/lib/types/venderLead';
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
