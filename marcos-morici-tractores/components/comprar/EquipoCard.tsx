import Image from 'next/image';
import type { Equipo } from '@/lib/types/equipo';
import { formatPrecioTarjeta } from '@/lib/catalog/catalogUtils';

interface EquipoCardProps {
  equipo: Equipo;
}

/**
 * Card de catálogo — layout dos filas como referencia Vialmaq:
 * fila 1: año (calendario) + badge VENTA; fila 2: horas (reloj) + precio.
 */
export default function EquipoCard({ equipo }: EquipoCardProps) {
  const img = equipo.imagenes[0] ?? '/logo/Logo Nav Bar.png';
  const titulo = equipo.titulo || `${equipo.marca} ${equipo.modelo}`;
  const detailHref = `/comprar/${encodeURIComponent(equipo.slug)}`;
  const precioTexto = formatPrecioTarjeta(equipo);
  const anoTexto = equipo.ano != null ? String(equipo.ano) : '—';
  const horasTexto =
    equipo.horas != null ? `${equipo.horas.toLocaleString('es-AR')} hs.` : '—';

  return (
    <article className="flex flex-col bg-white rounded-lg border border-[#E0E5E9] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <a href={detailHref} className="block relative aspect-[4/3] bg-[#F0F3F6] shrink-0">
        <Image
          src={img}
          alt={titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          unoptimized
        />
      </a>

      <div className="flex flex-col flex-1 p-4 min-h-0">
        <a href={detailHref} className="block">
          <h2 className="text-lg font-bold text-[#1a1a1a] uppercase leading-tight hover:text-[#4A7C59] transition-colors">
            {titulo}
          </h2>
        </a>

        <div className="mt-3 flex flex-col gap-2 flex-1 justify-between">
          <div className="flex items-center justify-between gap-2 min-h-[1.5rem]">
            <span className="inline-flex items-center gap-1.5 text-sm text-[#5A6C7D] min-w-0">
              <CalendarIcon />
              <span>{anoTexto}</span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border-2 border-amber-500 text-amber-800 bg-white shrink-0">
              Venta
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-[#5A6C7D] min-w-0">
              <ClockIcon />
              <span>{horasTexto}</span>
            </span>
            <p className="text-lg sm:text-xl font-bold text-[#1a1a1a] leading-tight text-right max-w-[min(100%,11rem)] break-words shrink-0">
              {precioTexto}
            </p>
          </div>
        </div>

        <a
          href={detailHref}
          className="mt-4 w-full text-center py-2.5 px-4 rounded-lg border-2 border-[#1E3A5F] text-[#1E3A5F] font-semibold uppercase text-sm hover:bg-[#D9773F] hover:border-[#D9773F] hover:text-white transition-colors"
        >
          Ver equipo
        </a>
      </div>
    </article>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-[#8A9BA8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-[#8A9BA8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <path d="M12 7v6l3 2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
