'use client';

import VenderTextField from '@/components/vender/fields/VenderTextField';
import VenderTextareaField from '@/components/vender/fields/VenderTextareaField';
import VenderSelectField from '@/components/vender/fields/VenderSelectField';
import VenderFileField from '@/components/vender/fields/VenderFileField';
import { useVenderSimpleLeadForm } from '@/components/vender/hooks/useVenderSimpleLeadForm';
import { MONEDA_OPTIONS } from '@/lib/vender/constants';

function primaryButtonClass(disabled?: boolean) {
  return [
    'inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors',
    'bg-[#1E3A5F] text-white border-2 border-[#1E3A5F]',
    'hover:bg-[#D9773F] hover:border-[#D9773F] hover:text-white',
    disabled ? 'opacity-50 pointer-events-none' : '',
  ].join(' ');
}

function secondaryButtonClass() {
  return 'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-[#1E3A5F] border-2 border-[#E0E5E9] hover:border-[#1E3A5F] transition-colors';
}

export default function VenderSimpleLeadForm() {
  const v = useVenderSimpleLeadForm();

  if (v.submitSuccess) {
    return (
      <div className="rounded-xl border border-[#4A7C59]/40 bg-[#F8FAFB] p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-[#1E3A5F] uppercase mb-2">Solicitud enviada</h2>
        <p className="text-[#5A6C7D] mb-6 max-w-lg mx-auto">
          Recibimos los datos y las fotos. Un administrador revisará tu publicación y se pondrá en contacto si hace falta
          antes de subirla al catálogo.
        </p>
        {v.storageWarning ? (
          <div
            className="mb-6 mx-auto max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950"
            role="status"
          >
            <strong className="font-semibold">Archivos:</strong> {v.storageWarning} El texto de la solicitud sí quedó registrado.
          </div>
        ) : null}
        {v.lastId ? <p className="text-xs text-[#5A6C7D] mb-6 font-mono">Ref.: {v.lastId}</p> : null}
        <button type="button" className={secondaryButtonClass()} onClick={v.reset}>
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {v.bannerError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {v.bannerError}
        </div>
      ) : null}

      <p className="text-sm text-[#5A6C7D] leading-relaxed">
        Completá los datos esenciales y tu nombre y celular de contacto. Un administrador cargará la ficha completa en el
        catálogo cuando corresponda.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <VenderTextField
          id="simple-marca"
          label="Marca"
          value={v.state.marca}
          onChange={(val) => v.setField('marca', val)}
          error={v.errors.marca}
        />
        <VenderTextField
          id="simple-modelo"
          label="Modelo"
          value={v.state.modelo}
          onChange={(val) => v.setField('modelo', val)}
          error={v.errors.modelo}
        />
      </div>

      <VenderTextareaField
        id="simple-desc"
        label="Descripción"
        value={v.state.descripcion}
        onChange={(val) => v.setField('descripcion', val)}
        error={v.errors.descripcion}
        rows={5}
      />

      <VenderFileField
        id="simple-imagenes"
        label="Fotos"
        description="Al menos una imagen."
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        multiple
        files={v.state.imagenes}
        onChange={(files) => v.setImagenes(Array.isArray(files) ? files : [])}
        error={v.errors.imagenes}
      />

      <VenderFileField
        id="simple-folleto"
        label="PDF / folleto (opcional)"
        accept=".pdf,application/pdf"
        files={v.state.folleto}
        onChange={(f) => v.setFolleto(Array.isArray(f) ? null : f)}
      />

      <div className="rounded-lg border border-[#E0E5E9] bg-[#F8FAFB]/80 px-4 py-3 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[#1E3A5F]">
          <input
            type="checkbox"
            checked={v.state.precioConsultar}
            onChange={(e) => v.setField('precioConsultar', e.target.checked)}
            className="rounded border-[#E0E5E9] text-[#4A7C59] focus:ring-[#4A7C59]"
          />
          Precio a consultar
        </label>
        {!v.state.precioConsultar ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <VenderTextField
              id="simple-precio"
              label="Precio"
              value={v.state.precio}
              onChange={(val) => v.setField('precio', val)}
              error={v.errors.precio}
            />
            <VenderSelectField
              id="simple-moneda"
              label="Moneda"
              value={v.state.moneda}
              options={MONEDA_OPTIONS}
              onChange={(val) => v.setField('moneda', val)}
            />
          </div>
        ) : (
          <p className="text-xs text-[#5A6C7D]">No hace falta importe si el precio es a consultar.</p>
        )}
      </div>

      <div className="border-t border-[#E0E5E9] pt-6 space-y-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1E3A5F]">Contacto</h3>
        <VenderTextField
          id="simple-nombre"
          label="Nombre y apellido"
          required
          value={v.state.nombreApellido}
          onChange={(val) => v.setField('nombreApellido', val)}
          error={v.errors.nombreApellido}
          autoComplete="name"
        />
        <VenderTextField
          id="simple-email"
          label="Correo electrónico (opcional)"
          type="email"
          value={v.state.email}
          onChange={(val) => v.setField('email', val)}
          error={v.errors.email}
          autoComplete="email"
        />
        <VenderTextField
          id="simple-celular"
          label="Celular / WhatsApp"
          required
          type="tel"
          value={v.state.celular}
          onChange={(val) => v.setField('celular', val)}
          error={v.errors.celular}
          autoComplete="tel"
        />
        <VenderTextField
          id="simple-ubicacion"
          label="Ubicación (opcional)"
          value={v.state.ubicacion}
          onChange={(val) => v.setField('ubicacion', val)}
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="button" className={primaryButtonClass(v.submitting)} onClick={v.submit} disabled={v.submitting}>
          {v.submitting ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </div>
    </div>
  );
}
