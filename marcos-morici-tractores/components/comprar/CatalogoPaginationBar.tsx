'use client';

import type { CatalogoPageSize } from '@/lib/catalog/constants';
import { CATALOGO_PAGE_SIZE_OPTIONS } from '@/lib/catalog/constants';

interface CatalogoPaginationBarProps {
  pageSafe: number;
  totalPages: number;
  pageSize: CatalogoPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: CatalogoPageSize) => void;
}

/** Lista de páginas con elipsis entre huecos (patrón tipo Magento / Vialmaq). */
function pageItems(current: number, total: number): (number | 'gap')[] {
  if (total <= 1) return [1];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, total, current - 1, current, current + 1]);
  for (let n = current - 2; n <= current + 2; n++) {
    if (n >= 1 && n <= total) set.add(n);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('gap');
    out.push(sorted[i]);
  }
  return out;
}

const pageBtnBase =
  'min-w-[2.5rem] h-10 px-2 rounded border text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2';
const pageBtnInactive = 'bg-white border-[#E0E5E9] text-[#374151] hover:border-[#1E3A5F] hover:text-[#1E3A5F]';
const pageBtnActive = 'bg-[#374151] border-[#374151] text-[#FFFBEB]';

const chevronBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded border border-[#E0E5E9] bg-white text-[#374151] hover:border-[#1E3A5F] hover:text-[#1E3A5F] disabled:opacity-40 disabled:pointer-events-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] focus-visible:ring-offset-2';

export default function CatalogoPaginationBar({
  pageSafe,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CatalogoPaginationBarProps) {
  const items = pageItems(pageSafe, totalPages);

  return (
    <nav
      className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Paginación del catálogo"
    >
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className={chevronBtn}
          aria-label="Página anterior"
          disabled={pageSafe <= 1}
          onClick={() => onPageChange(Math.max(1, pageSafe - 1))}
        >
          <ChevronLeftIcon />
        </button>
        {items.map((item, idx) =>
          item === 'gap' ? (
            <span key={`gap-${idx}`} className="px-1 text-[#5A6C7D] select-none" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`${pageBtnBase} ${item === pageSafe ? pageBtnActive : pageBtnInactive}`}
              aria-label={`Ir a página ${item}`}
              aria-current={item === pageSafe ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          className={chevronBtn}
          aria-label="Página siguiente"
          disabled={pageSafe >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, pageSafe + 1))}
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-[#5A6C7D]">
        <span className="font-medium text-[#374151]">Mostrar</span>
        <label className="sr-only" htmlFor="catalogo-page-size">
          Equipos por página
        </label>
        <select
          id="catalogo-page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as CatalogoPageSize)}
          className="rounded border border-[#E0E5E9] bg-white px-3 py-2 font-medium text-[#1E3A5F] focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]"
        >
          {CATALOGO_PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>por página</span>
      </div>
    </nav>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
