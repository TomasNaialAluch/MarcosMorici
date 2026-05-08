'use client';

import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import type { Equipo } from '@/lib/types/equipo';
import { formatPrecioLista } from '@/lib/catalog/catalogUtils';
import EquipoDetalleGaleria from '@/components/comprar/EquipoDetalleGaleria';
import EquipoDetallePdf from '@/components/comprar/EquipoDetallePdf';
import EquipoDetalleContactoPanel from '@/components/comprar/EquipoDetalleContactoPanel';
import EquipoDetallePreguntas from '@/components/comprar/EquipoDetallePreguntas';
import { TIPO_MAQUINARIA_OPTIONS } from '@/lib/vender/constants';
import { getWhatsAppUrl, getEquipmentMessage } from '@/lib/utils/whatsapp';

interface EquipoDetalleProps {
  equipo: Equipo;
  /** Ruta canónica relativa, ej. `/comprar/mi-slug` (para enlaces internos). */
  canonicalPath: string;
}

function labelTipoMaquinaria(value: string): string {
  const o = TIPO_MAQUINARIA_OPTIONS.find((x) => x.value === value);
  return o?.label ?? value;
}

function labelMoneda(m: Equipo['moneda']): string | null {
  if (!m) return null;
  return m === 'pesos' ? 'Peso argentino' : 'Dólar estadounidense';
}

export default function EquipoDetalle({ equipo, canonicalPath }: EquipoDetalleProps) {
  const titulo = (equipo.titulo || `${equipo.marca} ${equipo.modelo}`).trim();
  const waMsg = `${getEquipmentMessage(titulo)} — Ref: ${equipo.slug}`;
  const waHref = getWhatsAppUrl(waMsg);

  const specRows: { label: string; value: string }[] = [];

  if (equipo.sku?.trim()) specRows.push({ label: 'SKU / código', value: equipo.sku.trim() });
  if (equipo.categoria?.trim()) specRows.push({ label: 'Categoría', value: equipo.categoria.trim() });
  if (equipo.tipoMaquinaria?.trim()) {
    specRows.push({
      label: 'Tipo de maquinaria',
      value: labelTipoMaquinaria(equipo.tipoMaquinaria.trim()),
    });
  }
  if (equipo.tipoMaquinaria === 'otros' && equipo.tipoOtrosDescripcion?.trim()) {
    specRows.push({ label: 'Detalle del tipo', value: equipo.tipoOtrosDescripcion.trim() });
  }
  if (equipo.condicion) {
    specRows.push({ label: 'Condición', value: equipo.condicion === 'nuevo' ? 'Nuevo' : 'Usado' });
  }
  specRows.push({ label: 'Marca', value: equipo.marca });
  specRows.push({ label: 'Modelo', value: equipo.modelo });
  if (equipo.ano != null) specRows.push({ label: 'Año de fabricación', value: String(equipo.ano) });
  if (equipo.horas != null) {
    specRows.push({ label: 'Horas de uso', value: `${equipo.horas.toLocaleString('es-AR')} hs.` });
  }
  const monedaLabel = labelMoneda(equipo.moneda);
  if (monedaLabel && !equipo.precioConsultar && equipo.precio != null) {
    specRows.push({ label: 'Moneda del precio', value: monedaLabel });
  }
  specRows.push({ label: 'Precio', value: formatPrecioLista(equipo) });
  if (equipo.pesoTotalKg != null) {
    specRows.push({
      label: 'Peso total (kg)',
      value: equipo.pesoTotalKg.toLocaleString('es-AR'),
    });
  }
  if (equipo.capacidadBaldeM3 != null) {
    specRows.push({
      label: 'Capacidad de balde (m³)',
      value: String(equipo.capacidadBaldeM3).replace('.', ','),
    });
  }
  if (equipo.createdAt) {
    specRows.push({
      label: 'Publicado',
      value: equipo.createdAt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Comprar', href: '/comprar' },
          { label: titulo },
        ]}
      />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Imagen a la izquierda; título, precio, consultar y descripción a la derecha */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12 md:items-start">
          <div className="min-w-0 md:pr-2">
            <EquipoDetalleGaleria titulo={titulo} imagenes={equipo.imagenes} />
          </div>

          <div className="min-w-0 flex flex-col gap-5 md:pl-2">
            <header className="space-y-3">
              <h1 className="text-2xl md:text-4xl xl:text-5xl font-bold text-[#1E3A5F] uppercase leading-tight">{titulo}</h1>
              <p className="text-xl md:text-3xl xl:text-4xl font-semibold text-[#1E3A5F]">{formatPrecioLista(equipo)}</p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto justify-center px-10 py-3.5 rounded bg-[#6B7280] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#4B5563] transition-colors"
              >
                Consultar precios
              </a>
            </header>

            {equipo.descripcion?.trim() ? (
              <section aria-label="Descripción del equipo" className="pt-1">
                <div className="text-sm md:text-base text-[#5A6C7D] whitespace-pre-wrap leading-relaxed">
                  {equipo.descripcion.trim()}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <div className="mt-10 md:mt-12 space-y-6 max-w-5xl">
          {equipo.folletoPdfUrl ? <EquipoDetallePdf url={equipo.folletoPdfUrl} titulo={titulo} variant="compact" /> : null}

          <section aria-label="Características técnicas">
            <div className="rounded-lg border border-[#E0E5E9] overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {specRows.map((row) => (
                    <tr key={row.label} className="border-b border-[#E0E5E9] last:border-b-0 bg-white">
                      <th
                        scope="row"
                        className="text-left font-bold text-[#1E3A5F] py-3 px-4 align-top w-[45%] sm:w-[40%] bg-[#F8FAFB]/90"
                      >
                        {row.label}
                      </th>
                      <td className="text-[#5A6C7D] py-3 px-4 align-top">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Link href="/comprar" className="inline-flex text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline">
            ← Volver al catálogo
          </Link>
        </div>

        <div className="mt-12 max-w-5xl space-y-10">
          <EquipoDetalleContactoPanel equipo={equipo} />
          <EquipoDetallePreguntas equipo={equipo} />
        </div>

        <p className="mt-10 text-xs text-[#5A6C7D]">
          Referencia interna: <span className="font-mono">{equipo.slug}</span>
          {equipo.sku?.trim() ? (
            <>
              {' '}
              · SKU: <span className="font-mono">{equipo.sku.trim()}</span>
            </>
          ) : null}
          {canonicalPath ? (
            <>
              {' '}
              · URL:{' '}
              <Link href={canonicalPath} className="underline hover:text-[#1E3A5F]">
                {canonicalPath}
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
