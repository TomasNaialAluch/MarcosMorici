'use client';

import type { VenderFormErrors, VenderFormState } from '@/lib/types/venderLead';
import VenderTextField from '@/components/vender/fields/VenderTextField';
import VenderTextareaField from '@/components/vender/fields/VenderTextareaField';

interface VenderStepContactProps {
  state: VenderFormState;
  errors: VenderFormErrors;
  setField: <K extends keyof VenderFormState>(key: K, value: VenderFormState[K]) => void;
}

export default function VenderStepContact({ state, errors, setField }: VenderStepContactProps) {
  return (
    <div className="space-y-6">
      <VenderTextField
        id="nombreApellido"
        label="Nombre y apellido"
        value={state.nombreApellido}
        onChange={(v) => setField('nombreApellido', v)}
        error={errors.nombreApellido}
        required
        autoComplete="name"
      />
      <VenderTextField
        id="email"
        label="Correo electrónico"
        type="email"
        value={state.email}
        onChange={(v) => setField('email', v)}
        error={errors.email}
        required
        autoComplete="email"
      />
      <VenderTextField
        id="celular"
        label="Celular"
        type="tel"
        value={state.celular}
        onChange={(v) => setField('celular', v)}
        error={errors.celular}
        required
        autoComplete="tel"
      />
      <VenderTextField
        id="ubicacion"
        label="Ubicación geográfica de la máquina"
        value={state.ubicacion}
        onChange={(v) => setField('ubicacion', v)}
        error={errors.ubicacion}
        required
      />
      <VenderTextareaField
        id="mensajeAdicional"
        label="Si desea puede agregar un mensaje adicional"
        value={state.mensajeAdicional}
        onChange={(v) => setField('mensajeAdicional', v)}
        rows={4}
      />
    </div>
  );
}
