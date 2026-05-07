'use client';

import { useMemo } from 'react';
import type { VenderFormErrors, VenderFormState } from '@/lib/types/venderLead';
import VenderSelectField from '@/components/vender/fields/VenderSelectField';
import VenderTextField from '@/components/vender/fields/VenderTextField';
import VenderNumberField from '@/components/vender/fields/VenderNumberField';
import VenderTextareaField from '@/components/vender/fields/VenderTextareaField';
import VenderRadioGroup from '@/components/vender/fields/VenderRadioGroup';
import VenderFileField from '@/components/vender/fields/VenderFileField';
import { TIPO_MAQUINARIA_OPTIONS, CONDICION_OPTIONS, MONEDA_OPTIONS } from '@/lib/vender/constants';
import { getMachineFieldVisibility } from '@/lib/vender/fieldVisibility';
import { CATALOGO_CATEGORIAS_ORDEN } from '@/lib/catalog/catalogUtils';

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

  const categorias = useMemo(() => [...CATALOGO_CATEGORIAS_ORDEN], []);

  const categoriaOptions = useMemo(
    () => [{ value: '' as const, label: 'Elegir (opcional)' }, ...categorias.map((c) => ({ value: c, label: c }))],
    [categorias]
  );

  return (
    <div className="space-y-6">
      <VenderSelectField
        id="tipoMaquinaria"
        label="Tipo de maquinaria"
        value={state.tipoMaquinaria}
        options={TIPO_MAQUINARIA_OPTIONS}
        onChange={(v) => setField('tipoMaquinaria', v)}
      />

      {vis.tipoOtros ? (
        <VenderTextField
          id="tipoOtrosDescripcion"
          label="Indique el tipo de maquinaria"
          value={state.tipoOtrosDescripcion}
          onChange={(v) => setField('tipoOtrosDescripcion', v)}
          error={errors.tipoOtrosDescripcion}
        />
      ) : null}

      <VenderSelectField
        id="categoriaCatalogo"
        label="Categoría en catálogo «Comprar»"
        value={state.categoria}
        options={categoriaOptions}
        onChange={(v) => setField('categoria', v)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <VenderTextField
          id="marca"
          label="Marca"
          value={state.marca}
          onChange={(v) => setField('marca', v)}
          error={errors.marca}
        />
        <VenderTextField
          id="modelo"
          label="Modelo"
          value={state.modelo}
          onChange={(v) => setField('modelo', v)}
          error={errors.modelo}
        />
      </div>

      <VenderTextField
        id="titulo"
        label="Título en la ficha (opcional)"
        value={state.titulo}
        onChange={(v) => setField('titulo', v)}
        placeholder="Si lo dejás vacío, en el sitio podemos usar marca + modelo"
      />

      <VenderTextField
        id="sku"
        label="SKU / código interno (opcional)"
        value={state.sku}
        onChange={(v) => setField('sku', v)}
        placeholder="Ej. referencia de stock"
      />

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
        />
      ) : null}

      <VenderNumberField
        id="ano"
        label="Año de fabricación"
        value={state.ano}
        onChange={(v) => setField('ano', v)}
        error={errors.ano}
      />

      <div className="rounded-lg border border-[#E0E5E9] bg-[#F8FAFB]/80 px-4 py-3 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[#1E3A5F]">
          <input
            type="checkbox"
            checked={state.precioConsultar}
            onChange={(e) => setField('precioConsultar', e.target.checked)}
            className="rounded border-[#E0E5E9] text-[#4A7C59] focus:ring-[#4A7C59]"
          />
          Precio a consultar
        </label>
        {!state.precioConsultar ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <VenderTextField
              id="precio"
              label="Precio"
              value={state.precio}
              onChange={(v) => setField('precio', v)}
              error={errors.precio}
            />
            <VenderSelectField
              id="moneda"
              label="Moneda"
              value={state.moneda}
              options={MONEDA_OPTIONS}
              onChange={(v) => setField('moneda', v)}
              error={errors.moneda}
            />
          </div>
        ) : (
          <p className="text-xs text-[#5A6C7D]">No hace falta ingresar importe si el precio es a consultar.</p>
        )}
      </div>

      {vis.pesoTotalKg ? (
        <VenderNumberField
          id="pesoTotalKg"
          label="Peso total (kg)"
          value={state.pesoTotalKg}
          onChange={(v) => setField('pesoTotalKg', v)}
          error={errors.pesoTotalKg}
        />
      ) : null}

      {vis.capacidadBaldeM3 ? (
        <VenderNumberField
          id="capacidadBaldeM3"
          label="Capacidad de balde (m³)"
          value={state.capacidadBaldeM3}
          onChange={(v) => setField('capacidadBaldeM3', v)}
          error={errors.capacidadBaldeM3}
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
        label="Folleto / ficha técnica (archivo)"
        description="Opcional. PDF, imagen u otros formatos permitidos."
        multiple={false}
        files={state.folleto}
        onChange={(f) => setFolleto(Array.isArray(f) ? null : f)}
      />

      <VenderTextField
        id="folletoUrl"
        label="URL del folleto PDF (opcional)"
        value={state.folletoUrl}
        onChange={(v) => setField('folletoUrl', v)}
        placeholder="https://…"
      />

      <VenderFileField
        id="imagenes"
        label="Imágenes"
        description="Opcional. Podés seleccionar varias para la galería."
        multiple
        files={state.imagenes}
        onChange={(f) => setImagenes(Array.isArray(f) ? f : f ? [f] : [])}
      />
    </div>
  );
}
