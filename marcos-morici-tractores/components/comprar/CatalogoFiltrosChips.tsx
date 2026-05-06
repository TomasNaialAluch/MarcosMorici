'use client';

import type { CatalogoChip } from '@/components/comprar/useCatalogoEquipos';

interface CatalogoFiltrosChipsProps {
  chips: CatalogoChip[];
  onLimpiarTodo: () => void;
}

export default function CatalogoFiltrosChips({ chips, onLimpiarTodo }: CatalogoFiltrosChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-[#5A6C7D]">Filtros:</span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-[#F0F3F6] border border-[#E0E5E9] px-3 py-1 text-sm text-[#1E3A5F] hover:border-[#D9773F]"
        >
          {c.label}
          <span className="text-[#5A6C7D]" aria-hidden>
            ×
          </span>
        </button>
      ))}
      <button type="button" onClick={onLimpiarTodo} className="text-sm font-semibold text-[#D9773F] ml-2">
        Borrar todo
      </button>
    </div>
  );
}
