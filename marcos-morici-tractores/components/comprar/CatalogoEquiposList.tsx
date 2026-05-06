'use client';

import Link from 'next/link';
import type { Equipo } from '@/lib/types/equipo';
import type { CatalogoPageSize } from '@/lib/catalog/constants';
import EquipoCard from '@/components/comprar/EquipoCard';
import CatalogoPaginationBar from '@/components/comprar/CatalogoPaginationBar';

interface CatalogoEquiposListProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  rawLength: number;
  ordenadosLength: number;
  slice: Equipo[];
  pageSafe: number;
  totalPages: number;
  pageSize: CatalogoPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: CatalogoPageSize) => void;
}

const skeletonCount = (size: CatalogoPageSize) => Math.min(size, 12);

export default function CatalogoEquiposList({
  loading,
  error,
  onRetry,
  rawLength,
  ordenadosLength,
  slice,
  pageSafe,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CatalogoEquiposListProps) {
  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <span>{error}</span>
          <button type="button" onClick={onRetry} className="shrink-0 text-sm font-semibold underline">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && rawLength === 0 && (
        <div className="rounded-lg border border-[#E0E5E9] bg-[#F8FAFB] p-8 text-center text-[#5A6C7D]">
          <p className="mb-4">Todavía no hay equipos publicados.</p>
          <Link
            href="/vender"
            className="inline-block font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline"
          >
            Vender mi equipo
          </Link>
        </div>
      )}

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: skeletonCount(pageSize) }, (_, i) => (
            <div key={i} className="h-80 rounded-lg bg-[#F0F3F6] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && ordenadosLength > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {slice.map((e) => (
              <EquipoCard key={e.id} equipo={e} />
            ))}
          </div>
          <CatalogoPaginationBar
            pageSafe={pageSafe}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </>
  );
}
