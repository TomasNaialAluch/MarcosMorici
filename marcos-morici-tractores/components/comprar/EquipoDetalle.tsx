'use client';

import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import type { Equipo } from '@/lib/types/equipo';
import { formatUsd } from '@/lib/catalog/catalogUtils';
import EquipoDetalleGaleria from '@/components/comprar/EquipoDetalleGaleria';
import EquipoDetallePdf from '@/components/comprar/EquipoDetallePdf';
import EquipoDetalleContactoPanel from '@/components/comprar/EquipoDetalleContactoPanel';

interface EquipoDetalleProps {
  equipo: Equipo;
  /** Ruta canónica relativa, ej. `/comprar/mi-slug` (para enlaces internos). */
  canonicalPath: string;
}

export default function EquipoDetalle({ equipo, canonicalPath }: EquipoDetalleProps) {
  const titulo = (equipo.titulo || `${equipo.marca} ${equipo.modelo}`).trim();

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Comprar', href: '/comprar' },
          { label: titulo },
        ]}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-[#1E3A5F] uppercase leading-tight">{titulo}</h1>
            {equipo.categoria && (
              <p className="mt-2 text-sm font-medium text-[#5A6C7D] uppercase tracking-wide">{equipo.categoria}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase px-3 py-1.5 rounded-full border-2 border-[#4A7C59] text-[#4A7C59]">
              Venta
            </span>
            {equipo.destacado && (
              <span className="text-xs font-bold uppercase px-3 py-1.5 rounded-full bg-[#D9773F] text-white">Destacado</span>
            )}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <EquipoDetalleGaleria titulo={titulo} imagenes={equipo.imagenes} />

          <div className="space-y-6">
            <p className="text-3xl md:text-4xl font-bold text-[#1E3A5F]">
              {equipo.precioConsultar || equipo.precio == null ? 'Consultar valor' : formatUsd(equipo.precio)}
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-[#E0E5E9] pt-6">
              <Spec label="Marca" value={equipo.marca} />
              <Spec label="Modelo" value={equipo.modelo} />
              {equipo.ano != null && <Spec label="Año" value={String(equipo.ano)} />}
              {equipo.horas != null && (
                <Spec label="Horas de uso" value={`${equipo.horas.toLocaleString('es-AR')} hs.`} />
              )}
              {equipo.capacidadBaldeM3 != null && (
                <Spec label="Capacidad de balde" value={`${equipo.capacidadBaldeM3} m³`} />
              )}
              {equipo.pesoTotalKg != null && (
                <Spec label="Peso total" value={`${equipo.pesoTotalKg.toLocaleString('es-AR')} kg`} />
              )}
              {equipo.createdAt && (
                <Spec
                  label="Publicado"
                  value={equipo.createdAt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
              )}
            </dl>

            <Link
              href="/comprar"
              className="inline-flex text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </div>

        {equipo.descripcion ? (
          <section className="mt-12 max-w-4xl" aria-labelledby="desc-equipo">
            <h2 id="desc-equipo" className="text-lg font-bold text-[#1E3A5F] uppercase mb-3">
              Descripción
            </h2>
            <div className="text-sm md:text-base max-w-none text-[#5A6C7D] whitespace-pre-wrap leading-relaxed">
              {equipo.descripcion}
            </div>
          </section>
        ) : null}

        {equipo.folletoPdfUrl ? (
          <div className="mt-12 max-w-5xl">
            <EquipoDetallePdf url={equipo.folletoPdfUrl} titulo={titulo} />
          </div>
        ) : null}

        <div className="mt-12 max-w-5xl">
          <EquipoDetalleContactoPanel equipo={equipo} />
        </div>

        <p className="mt-10 text-xs text-[#5A6C7D]">
          Referencia interna: <span className="font-mono">{equipo.slug}</span>
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

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#E0E5E9]/80 pb-3 sm:border-0 sm:pb-0">
      <dt className="text-[#5A6C7D] font-medium">{label}</dt>
      <dd className="text-[#1E3A5F] font-semibold mt-0.5">{value}</dd>
    </div>
  );
}
