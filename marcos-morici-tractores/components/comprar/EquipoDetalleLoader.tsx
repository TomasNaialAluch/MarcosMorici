'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EquipoDetalle from '@/components/comprar/EquipoDetalle';
import { fetchEquipoPorSlugQuery } from '@/lib/firebase/equipos';
import type { Equipo } from '@/lib/types/equipo';
import { isBuildExportPlaceholderSlug } from '@/lib/catalog/buildExportPlaceholderSlug';
import { buildProductJsonLd } from '@/lib/seo/productJsonLd';

function absolutePageUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const path = `/comprar/${encodeURIComponent(slug)}`;
  if (base) return `${base}${path}`;
  return path;
}

export default function EquipoDetalleLoader({ slug }: { slug: string }) {
  const [equipo, setEquipo] = useState<Equipo | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (isBuildExportPlaceholderSlug(slug)) {
        if (!cancelled) setEquipo(null);
        return;
      }
      try {
        const e = await fetchEquipoPorSlugQuery(slug);
        if (cancelled) return;
        setEquipo(e);
        if (e) {
          const titulo = (e.titulo || `${e.marca} ${e.modelo}`).trim();
          document.title = `${titulo} | Comprar | Marcos Morici Tractores`;
          const pageUrl = absolutePageUrl(e.slug);
          const jsonLd = buildProductJsonLd(e, pageUrl.startsWith('http') ? pageUrl : '');
          document.getElementById('mmt-product-jsonld')?.remove();
          const script = document.createElement('script');
          script.id = 'mmt-product-jsonld';
          script.type = 'application/ld+json';
          script.text = JSON.stringify(jsonLd);
          document.head.appendChild(script);
        }
      } catch {
        if (!cancelled) setEquipo(null);
      }
    })();

    return () => {
      cancelled = true;
      document.getElementById('mmt-product-jsonld')?.remove();
    };
  }, [slug]);

  if (equipo === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-[#5A6C7D] text-sm">Cargando ficha del equipo…</p>
      </div>
    );
  }

  if (!equipo) {
    return (
      <div className="min-h-[50vh] bg-white flex flex-col items-center justify-center px-4 py-16 text-center text-[#5A6C7D]">
        <p className="mb-6 max-w-md">No encontramos ese equipo en el catálogo o ya no está disponible.</p>
        <Link href="/comprar" className="font-semibold text-[#1E3A5F] underline hover:text-[#D9773F]">
          Ir al catálogo Comprar
        </Link>
      </div>
    );
  }

  return <EquipoDetalle equipo={equipo} canonicalPath={`/comprar/${equipo.slug}`} />;
}
