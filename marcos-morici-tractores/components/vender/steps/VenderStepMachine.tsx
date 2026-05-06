'use client';

import type { VenderFormErrors, VenderFormState } from '@/lib/types/venderLead';
import VenderSelectField from '@/components/vender/fields/VenderSelectField';
import VenderTextField from '@/components/vender/fields/VenderTextField';
import VenderNumberField from '@/components/vender/fields/VenderNumberField';
import VenderTextareaField from '@/components/vender/fields/VenderTextareaField';
import VenderRadioGroup from '@/components/vender/fields/VenderRadioGroup';
import VenderFileField from '@/components/vender/fields/VenderFileField';
import { TIPO_MAQUINARIA_OPTIONS, CONDICION_OPTIONS, MONEDA_OPTIONS } from '@/lib/vender/constants';
import { getMachineFieldVisibility } from '@/lib/vender/fieldVisibility';

interface VenderStepMachineProps {
  state: VenderFormState;
  errors: VenderFormErrors;
  setField: <K extends keyof VenderFormState>(key: K, value: VenderFormState[K]) => void;
  setFolleto: (file: File | null) => void;
  setImagenes: (files: File[]) => void;
}

export default function VenderStepMachine({
  state,
  errors,
  setField,
  setFolleto,
  setImagenes,
}: VenderStepMachineProps) {
  const vis = getMachineFieldVisibility({
    tipoMaquinaria: state.tipoMaquinaria,
    condicion: state.condicion,
  });

  return (
    <div className="space-y-6">
      <VenderSelectField
        id="tipoMaquinaria"
        label="Tipo de maquinaria"
        value={state.tipoMaquinaria}
        options={TIPO_MAQUINARIA_OPTIONS}
        onChange={(v) => setField('tipoMaquinaria', v)}
        required
      />

      {vis.tipoOtros ? (
        <VenderTextField
          id="tipoOtrosDescripcion"
          label="Indique el tipo de maquinaria"
          value={state.tipoOtrosDescripcion}
          onChange={(v) => setField('tipoOtrosDescripcion', v)}
          error={errors.tipoOtrosDescripcion}
          required
        />
      ) : null}

      <VenderRadioGroup
        name="condicion"
        label="Condición"
        value={state.condicion}
        options={CONDICION_OPTIONS}
        onChange={(v) => setField('condicion', v)}
      />

      {vis.horas ? (
        <VenderNumberField
          id="horas"
          label="Horas de uso (hs)"
          value={state.horas}
          onChange={(v) => setField('horas', v)}
          error={errors.horas}
          required
        />
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <VenderTextField
          id="marca"
          label="Marca"
          value={state.marca}
          onChange={(v) => setField('marca', v)}
          error={errors.marca}
          required
        />
        <VenderTextField
          id="modelo"
          label="Modelo"
          value={state.modelo}
          onChange={(v) => setField('modelo', v)}
          error={errors.modelo}
          required
        />
      </div>

      <VenderNumberField
        id="ano"
        label="Año de fabricación"
        value={state.ano}
        onChange={(v) => setField('ano', v)}
        error={errors.ano}
        required
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <VenderTextField
          id="precio"
          label="Precio"
          value={state.precio}
          onChange={(v) => setField('precio', v)}
          error={errors.precio}
          required
        />
        <VenderSelectField
          id="moneda"
          label="Moneda"
          value={state.moneda}
          options={MONEDA_OPTIONS}
          onChange={(v) => setField('moneda', v)}
          error={errors.moneda}
          required
        />
      </div>

      {vis.pesoTotalKg ? (
        <VenderNumberField
          id="pesoTotalKg"
          label="Peso total (Kg)"
          value={state.pesoTotalKg}
          onChange={(v) => setField('pesoTotalKg', v)}
          error={errors.pesoTotalKg}
          required
        />
      ) : null}

      {vis.capacidadBaldeM3 ? (
        <VenderNumberField
          id="capacidadBaldeM3"
          label="Capacidad de balde (m³)"
          value={state.capacidadBaldeM3}
          onChange={(v) => setField('capacidadBaldeM3', v)}
          error={errors.capacidadBaldeM3}
          required
        />
      ) : null}

      <VenderTextareaField
        id="descripcionMaquina"
        label="Descripción de la máquina"
        value={state.descripcionMaquina}
        onChange={(v) => setField('descripcionMaquina', v)}
        rows={5}
      />

      <VenderFileField
        id="folleto"
        label="Folleto de la máquina (PDF u otro formato permitido)"
        description="Opcional. Formatos: documento, imagen o PDF."
        multiple={false}
        files={state.folleto}
        onChange={(f) => setFolleto(Array.isArray(f) ? null : f)}
      />

      <VenderFileField
        id="imagenes"
        label="Imágenes"
        description="Opcional. Podés seleccionar varias."
        multiple
        files={state.imagenes}
        onChange={(f) => setImagenes(Array.isArray(f) ? f : f ? [f] : [])}
      />
    </div>
  );
}
