/** Documento en `equipoPreguntas/{id}` — preguntas públicas en ficha de producto. */
export interface EquipoPreguntaDoc {
  id: string;
  equipoId: string;
  slug: string;
  nombre: string;
  /** WhatsApp / teléfono opcional. */
  telefono: string | null;
  texto: string;
  createdAt: Date | null;
  visible: boolean;
  respuesta: string | null;
  respondidoEn: Date | null;
  respondidoPorUid: string | null;
}
