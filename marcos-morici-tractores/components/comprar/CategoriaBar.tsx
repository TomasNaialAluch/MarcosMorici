'use client';

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useViewportWidth } from '@/hooks/useViewportWidth';
import { categoriaBarLayoutFromWidth } from '@/components/comprar/categoriaBarLayout';

const REF_IMG_BASE = '/reference/vialmaq-barra-categorias';

interface CategoriaBarProps {
  categorias: string[];
  activa: string | null;
  onSelect: (categoria: string | null) => void;
}

/** Misma heurística que antes (SVG); ahora resuelve PNG de referencia en `public/reference/…`. */
export function categoriaBarImagenSrc(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes('excavad')) return `${REF_IMG_BASE}/excavadoras.png`;
  if (n.includes('retrop')) return `${REF_IMG_BASE}/retropalas.png`;
  if (n.includes('minicarg')) return `${REF_IMG_BASE}/minicargadoras.png`;
  if (n.includes('cargador')) return `${REF_IMG_BASE}/cargadoras.png`;
  if (n.includes('compact')) return `${REF_IMG_BASE}/compactacion.png`;
  if (n.includes('motonivel')) return `${REF_IMG_BASE}/motoniveladoras.png`;
  if (n.includes('topad')) return `${REF_IMG_BASE}/topadoras.png`;
  return `${REF_IMG_BASE}/otros.png`;
}

export default function CategoriaBar({ categorias, activa, onSelect }: CategoriaBarProps) {
  const vw = useViewportWidth(1024);
  const L = useMemo(() => categoriaBarLayoutFromWidth(vw), [vw]);

  const btnBase =
    'box-border flex h-full min-h-0 shrink-0 flex-col items-center justify-between gap-0.5 rounded-md border border-transparent px-1.5 py-1 transition-colors';

  const btnSizing = (extra?: CSSProperties): CSSProperties => ({
    minWidth: Math.max(L.colWidthPx, L.thumbW + 8),
    width: 'max-content',
    ...extra,
  });
  return (
    <div className="border-b border-[#E0E5E9] bg-[#F8FAFB]" lang="es">
      <div className="container mx-auto overflow-x-auto px-2 py-1.5 sm:px-3 md:overflow-x-visible">
        <div
          className="mx-auto flex w-max max-w-full flex-nowrap items-stretch justify-center"
          style={{ gap: L.gapPx }}
        >
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`${btnBase} ${
              activa == null
                ? 'bg-white shadow-sm border-[#4A7C59] text-[#1E3A5F]'
                : 'text-[#5A6C7D] hover:bg-white/80'
            }`}
            style={btnSizing()}
          >
            <span
              className="flex shrink-0 items-center justify-center"
              style={{ height: L.thumbH, width: L.thumbW }}
            >
              <IconTodos className={activa == null ? 'text-[#4A7C59]' : 'text-[#5A6C7D]'} size={L.iconSize} />
            </span>
            <span
              className="flex min-h-0 w-full flex-1 flex-col justify-center px-0.5 text-center font-semibold uppercase leading-tight tracking-tight whitespace-nowrap"
              style={{ fontSize: L.labelFontPx }}
            >
              Todos
            </span>
          </button>
          {categorias.map((cat) => {
            const active = activa === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelect(cat)}
                className={`${btnBase} ${
                  active
                    ? 'bg-white shadow-sm border-[#4A7C59] text-[#1E3A5F]'
                    : 'text-[#5A6C7D] hover:bg-white/80'
                }`}
                style={btnSizing()}
              >
                <span
                  className={`flex shrink-0 items-center justify-center ${active ? 'opacity-100' : 'opacity-[0.9]'}`}
                  style={{ height: L.thumbH, width: L.thumbW }}
                >
                  <img
                    src={categoriaBarImagenSrc(cat)}
                    alt=""
                    width={L.thumbW}
                    height={L.thumbH}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                </span>
                <span
                  className="flex min-h-0 w-full flex-1 flex-col justify-center px-0.5 text-center font-semibold uppercase leading-tight whitespace-nowrap"
                  style={{ fontSize: L.labelFontPx }}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IconTodos({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      className={`shrink-0 ${className ?? ''}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="5" y="8" width="22" height="18" rx="1" />
      <path d="M5 14h22" />
    </svg>
  );
}
