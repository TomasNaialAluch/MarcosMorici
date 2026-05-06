/**
 * Datos de contacto y ubicación para NAP (footer, JSON-LD futuro).
 * Configurá en `.env.local` lo que corresponda a la operación real.
 */
export const BUSINESS_NAME = 'Marcos Morici Tractores';

export function getBusinessTagline(): string {
  return (
    process.env.NEXT_PUBLIC_BUSINESS_TAGLINE?.trim() ||
    'Venta de maquinaria y repuestos. Más de 30 años en el rubro.'
  );
}

/** Texto de cobertura / país (SEO local). */
export function getBusinessCoverage(): string {
  return (
    process.env.NEXT_PUBLIC_BUSINESS_COVERAGE?.trim() ||
    'Argentina · Atención y logística a nivel nacional.'
  );
}

export function getBusinessAddress(): string | undefined {
  const a = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim();
  return a || undefined;
}

export function getBusinessEmail(): string | undefined {
  const e = process.env.NEXT_PUBLIC_BUSINESS_EMAIL?.trim();
  return e || undefined;
}

/** Número solo dígitos, ej. 5491123456789 para wa.me / tel */
export function getWhatsAppDigits(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
}

export function getBusinessPhoneTel(): string | undefined {
  const t = process.env.NEXT_PUBLIC_BUSINESS_PHONE_TEL?.trim();
  return t || undefined;
}

/** Etiqueta legible para mostrar (ej. +54 9 11 1234-5678) */
export function getBusinessPhoneLabel(): string | undefined {
  return process.env.NEXT_PUBLIC_BUSINESS_PHONE_LABEL?.trim() || undefined;
}
