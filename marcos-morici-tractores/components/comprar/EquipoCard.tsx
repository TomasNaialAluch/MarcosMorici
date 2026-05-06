import Image from 'next/image';
import Link from 'next/link';
import type { Equipo } from '@/lib/types/equipo';
import { formatUsd } from '@/lib/catalog/catalogUtils';

interface EquipoCardProps {
  equipo: Equipo;
}

/**
 * Card de catálogo — layout alineado a README_COMPRAR_VIALMAQ §2.5.1–2.5.2:
 * imagen dominante, título, fila con specs a la izquierda y badge + precio a la derecha (referencia Vialmaq),
 * CTA «Ver equipo» y paleta Marcos Morici (§2.5.2 / README_PALETA).
 */
export default function EquipoCard({ equipo }: EquipoCardProps) {
  const img = equipo.imagenes[0] ?? '/logo/Logo Nav Bar.png';
  const titulo = equipo.titulo || `${equipo.marca} ${equipo.modelo}`;
  const detailHref = `/comprar/${encodeURIComponent(equipo.slug)}`;
  const precioTexto =
    equipo.precioConsultar || equipo.precio == null ? 'Consultar valor' : formatUsd(equipo.precio);

  return (
    <article className="flex flex-col bg-white rounded-lg border border-[#E0E5E9] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={detailHref} className="block relative aspect-[4/3] bg-[#F0F3F6] shrink-0">
        <Image
          src={img}
          alt={titulo}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          unoptimized
        />
      </Link>

      <div className="flex flex-col flex-1 p-4 min-h-0">
        <Link href={detailHref} className="block">
          <h2 className="text-lg font-bold text-[#1E3A5F] uppercase leading-tight hover:text-[#4A7C59] transition-colors">
            {titulo}
          </h2>
        </Link>

        <div className="mt-3 flex flex-1 justify-between gap-3 items-start">
          <div className="flex flex-col gap-2 text-sm text-[#5A6C7D] min-w-0 min-h-[2.5rem] justify-center">
            {equipo.ano != null && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon />
                <span>{equipo.ano}</span>
              </span>
            )}
            {equipo.horas != null && (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon />
                <span>{equipo.horas.toLocaleString('es-AR')} hs.</span>
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0 text-right">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border-2 border-[#4A7C59] text-[#4A7C59] bg-white">
              Venta
            </span>
            <p className="text-lg sm:text-xl font-bold text-[#1E3A5F] leading-tight max-w-[11rem] break-words">
              {precioTexto}
            </p>
          </div>
        </div>

        <Link
          href={detailHref}
          className="mt-4 w-full text-center py-2.5 px-4 rounded-lg border-2 border-[#1E3A5F] text-[#1E3A5F] font-semibold uppercase text-sm hover:bg-[#D9773F] hover:border-[#D9773F] hover:text-white transition-colors"
        >
          Ver equipo
        </Link>
      </div>
    </article>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <path d="M12 7v6l3 2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
