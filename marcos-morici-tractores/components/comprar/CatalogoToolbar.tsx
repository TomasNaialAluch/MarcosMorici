'use client';

import type { SortOption } from '@/lib/types/equipo';

interface CatalogoToolbarProps {
  onOpenFilters: () => void;
  loading: boolean;
  ordenadosLength: number;
  start: number;
  end: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function CatalogoToolbar({
  onOpenFilters,
  loading,
  ordenadosLength,
  start,
  end,
  sort,
  onSortChange,
}: CatalogoToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <button
        type="button"
        className="lg:hidden w-full sm:w-auto py-2.5 px-4 rounded-lg bg-[#1E3A5F] text-white font-semibold uppercase text-sm"
        onClick={onOpenFilters}
      >
        Filtros
      </button>
      <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-[#5A6C7D]" aria-live="polite">
          {loading
            ? 'Cargando equipos…'
            : ordenadosLength === 0
              ? 'No hay equipos con estos criterios.'
              : `Artículos ${start}–${end} de ${ordenadosLength}`}
        </p>
        <label className="flex items-center gap-2 text-sm text-[#5A6C7D] shrink-0">
          <span>Ordenar por</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="border border-[#E0E5E9] rounded-lg px-3 py-2 text-[#1E3A5F] font-medium bg-white"
          >
            <option value="destacados">Destacados primero</option>
            <option value="precioAsc">Precio: menor a mayor</option>
            <option value="precioDesc">Precio: mayor a menor</option>
            <option value="anoDesc">Año: más nuevo</option>
            <option value="anoAsc">Año: más antiguo</option>
            <option value="horasAsc">Menos horas de uso</option>
            <option value="recientes">Más recientes</option>
          </select>
        </label>
      </div>
    </div>
  );
}
