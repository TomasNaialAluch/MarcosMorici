/**
 * Genera URL de WhatsApp con mensaje pre-rellenado
 */
export function getWhatsAppUrl(
  message: string,
  phoneNumber?: string
): string {
  const phone = phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Abre WhatsApp con mensaje pre-rellenado
 */
export function openWhatsApp(
  message: string,
  phoneNumber?: string
): void {
  const url = getWhatsAppUrl(message, phoneNumber);
  window.open(url, '_blank');
}

/**
 * Genera mensaje para consulta de equipo
 */
export function getEquipmentMessage(equipmentName: string): string {
  return `Hola, me interesa el equipo: ${equipmentName}`;
}
