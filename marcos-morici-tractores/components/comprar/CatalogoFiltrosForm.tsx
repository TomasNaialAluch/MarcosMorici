'use client';

import type { ReactNode } from 'react';
import type { CatalogoEquiposController } from '@/components/comprar/useCatalogoEquipos';
import { CATALOGO_MARCA_PREVIEW } from '@/components/comprar/useCatalogoEquipos';
import CatalogoDualRange from '@/components/comprar/CatalogoDualRange';
import { formatUsd } from '@/lib/catalog/catalogUtils';

type Filtros = CatalogoEquiposController['filtros'];

function FiltroBloque({
  titulo,
  abierto,
  onToggle,
  children,
}: {
  titulo: string;
  abierto: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[#E0E5E9] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2.5 text-left text-xs font-bold text-[#1E3A5F] uppercase tracking-wide"
        aria-expanded={abierto}
      >
        {titulo}
        <span className="text-base leading-none text-[#5A6C7D]" aria-hidden>
          {abierto ? '−' : '+'}
        </span>
      </button>
      {abierto && <div className="pb-4 pt-0">{children}</div>}
    </div>
  );
}

const btnAceptar =
  'w-full py-2 rounded-lg border-2 border-[#1E3A5F] bg-white text-[#1E3A5F] text-sm font-semibold uppercase hover:bg-[#F0F3F6] transition-colors';

export default function CatalogoFiltrosForm({ f }: { f: Filtros }) {
  const s = f.stats;
  if (!s) {
    return <p className="text-sm text-[#5A6C7D]">Sin datos de catálogo.</p>;
  }

  const nProductos = (n: number) => (
    <p className="mb-2 text-xs text-[#5A6C7D]">
      <span className="font-semibold text-[#1E3A5F]">{n}</span> {n === 1 ? 'equipo' : 'equipos'}
    </p>
  );

  const stepHoras =
    s.horasMax > s.horasMin ? Math.max(1, Math.round((s.horasMax - s.horasMin) / 80)) : 1;
  const stepPeso =
    s.pesoMax > s.pesoMin ? Math.max(1, Math.round((s.pesoMax - s.pesoMin) / 60)) : 1;
  const stepPrecio =
    s.precioMax > s.precioMin ? Math.max(1, Math.round((s.precioMax - s.precioMin) / 100)) : 1;

  return (
    <div className="space-y-0">
      <FiltroBloque titulo="Precio (USD)" abierto={f.precioOpen} onToggle={() => f.setPrecioOpen((v) => !v)}>
        <CatalogoDualRange
          min={s.precioMin}
          max={s.precioMax}
          low={f.precioDraftMin}
          high={f.precioDraftMax}
          step={stepPrecio}
          onChange={(lo, hi) => {
            f.setPrecioDraftMin(lo);
            f.setPrecioDraftMax(hi);
          }}
          format={(v) => formatUsd(v)}
        />
        {nProductos(f.previewPrecio)}
        <button type="button" onClick={f.aplicarPrecio} className={btnAceptar}>
          Aceptar
        </button>
      </FiltroBloque>

      <FiltroBloque titulo="Marca" abierto={f.marcaOpen} onToggle={() => f.setMarcaOpen((v) => !v)}>
        <input
          type="search"
          placeholder="Buscar (Caterpillar, Komatsu, …)"
          className="mb-3 w-full rounded-lg border border-[#E0E5E9] px-3 py-2 text-sm text-[#1E3A5F] placeholder:text-[#5A6C7D]"
          value={f.marcaBusqueda}
          onChange={(e) => f.setMarcaBusqueda(e.target.value)}
        />
        <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
          {f.marcasVisibles.map(([marca, count]) => (
            <li key={marca}>
              <label className="flex cursor-pointer items-center gap-2 text-[#5A6C7D] hover:text-[#1E3A5F]">
                <input
                  type="checkbox"
                  checked={f.marcasSel.has(marca)}
                  onChange={() => f.toggleMarca(marca)}
                  className="rounded border-[#E0E5E9] text-[#4A7C59] focus:ring-[#4A7C59]"
                />
                <span>
                  {marca} <span className="text-[#8A9BA8]">({count})</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {f.marcasListaLength > CATALOGO_MARCA_PREVIEW && (
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F]"
            onClick={() => f.setMarcasExpanded((v) => !v)}
          >
            {f.marcasExpanded ? 'Ver menos' : 'Ver más +'}
          </button>
        )}
      </FiltroBloque>

      {f.mostrarBalde && (
        <FiltroBloque
          titulo="Capacidad de balde (m³)"
          abierto={f.baldeOpen}
          onToggle={() => f.setBaldeOpen((v) => !v)}
        >
          <CatalogoDualRange
            min={s.baldeMin}
            max={s.baldeMax}
            low={f.baldeDraftMin}
            high={f.baldeDraftMax}
            step={0.1}
            onChange={(lo, hi) => {
              f.setBaldeDraftMin(lo);
              f.setBaldeDraftMax(hi);
            }}
            format={(v) => `${v.toLocaleString('es-AR', { maximumFractionDigits: 1 })} m³`}
          />
          {nProductos(f.previewBalde)}
          <button type="button" onClick={f.aplicarBalde} className={btnAceptar}>
            Aceptar
          </button>
        </FiltroBloque>
      )}

      <FiltroBloque
        titulo="Año de fabricación"
        abierto={f.yearOpen}
        onToggle={() => f.setYearOpen((v) => !v)}
      >
        <CatalogoDualRange
          min={s.anoMin}
          max={s.anoMax}
          low={f.yearDraftMin}
          high={f.yearDraftMax}
          step={1}
          onChange={(lo, hi) => {
            f.setYearDraftMin(lo);
            f.setYearDraftMax(hi);
          }}
          format={(v) => String(Math.round(v))}
        />
        {nProductos(f.previewAno)}
        <button type="button" onClick={f.aplicarAno} className={btnAceptar}>
          Aceptar
        </button>
      </FiltroBloque>

      {f.mostrarHoras && (
        <FiltroBloque titulo="Horas de uso" abierto={f.horasOpen} onToggle={() => f.setHorasOpen((v) => !v)}>
          <CatalogoDualRange
            min={s.horasMin}
            max={s.horasMax}
            low={f.horasDraftMin}
            high={f.horasDraftMax}
            step={stepHoras}
            onChange={(lo, hi) => {
              f.setHorasDraftMin(lo);
              f.setHorasDraftMax(hi);
            }}
            format={(v) => `${Math.round(v).toLocaleString('es-AR')} hs.`}
          />
          {nProductos(f.previewHoras)}
          <button type="button" onClick={f.aplicarHoras} className={btnAceptar}>
            Aceptar
          </button>
        </FiltroBloque>
      )}

      {f.mostrarPeso && (
        <FiltroBloque titulo="Peso total (kg)" abierto={f.pesoOpen} onToggle={() => f.setPesoOpen((v) => !v)}>
          <CatalogoDualRange
            min={s.pesoMin}
            max={s.pesoMax}
            low={f.pesoDraftMin}
            high={f.pesoDraftMax}
            step={stepPeso}
            onChange={(lo, hi) => {
              f.setPesoDraftMin(lo);
              f.setPesoDraftMax(hi);
            }}
            format={(v) => `${Math.round(v).toLocaleString('es-AR')} kg`}
          />
          {nProductos(f.previewPeso)}
          <button type="button" onClick={f.aplicarPeso} className={btnAceptar}>
            Aceptar
          </button>
        </FiltroBloque>
      )}

      <div className="pt-4">
        <button
          type="button"
          onClick={f.limpiarFiltros}
          className="w-full rounded-lg border-2 border-[#1E3A5F] py-2 text-sm font-semibold uppercase text-[#1E3A5F] hover:bg-[#F0F3F6]"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
