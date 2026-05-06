import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  BUILD_EXPORT_PLACEHOLDER_SLUG,
  isBuildExportPlaceholderSlug,
} from '@/lib/catalog/buildExportPlaceholderSlug';
import { fetchEquiposPublicados, fetchEquipoPorSlugQuery } from '@/lib/firebase/equipos';
import EquipoDetalle from '@/components/comprar/EquipoDetalle';
import { buildProductJsonLd } from '@/lib/seo/productJsonLd';

type Props = { params: Promise<{ slug: string }> };

/** Requerido con `output: 'export'`: rutas de ficha generadas en build (README_SEO — URLs estables). */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const equipos = await fetchEquiposPublicados();
    const slugs = equipos
      .map((e) => e.slug.trim())
      .filter(Boolean)
      .map((slug) => ({ slug }));
    if (slugs.length > 0) return slugs;
  } catch {
    /* sin Firebase en build o error de red: placeholder para no romper export */
  }
  return [{ slug: BUILD_EXPORT_PLACEHOLDER_SLUG }];
}

function absolutePageUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const path = `/comprar/${encodeURIComponent(slug)}`;
  if (base) return `${base}${path}`;
  return path;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (isBuildExportPlaceholderSlug(slug)) {
    return {
      title: 'Catálogo | Marcos Morici Tractores',
      description: 'Maquinaria usada. Volvé al listado de equipos en venta.',
      robots: { index: false, follow: true },
    };
  }
  const equipo = await fetchEquipoPorSlugQuery(slug);
  if (!equipo) {
    return { title: 'Equipo no encontrado | Marcos Morici Tractores' };
  }
  const titulo = (equipo.titulo || `${equipo.marca} ${equipo.modelo}`).trim();
  const desc =
    (equipo.descripcion && equipo.descripcion.slice(0, 158).trim()) ||
    `${titulo}. Maquinaria usada y equipos en venta. Consultá precio, horas y ficha. Marcos Morici Tractores, Argentina.`;
  const canonical = absolutePageUrl(equipo.slug);
  return {
    title: `${titulo} | Comprar | Marcos Morici Tractores`,
    description: desc,
    openGraph: {
      title: titulo,
      description: desc,
      type: 'website',
      ...(canonical.startsWith('http') ? { url: canonical } : {}),
    },
    ...(canonical.startsWith('http') ? { alternates: { canonical } } : {}),
  };
}

export default async function ComprarEquipoDetallePage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  if (isBuildExportPlaceholderSlug(slug)) {
    return (
      <div className="min-h-[50vh] bg-white flex flex-col items-center justify-center px-4 py-16 text-center text-[#5A6C7D]">
        <p className="mb-6 max-w-md">
          En esta build estática no se generaron fichas (sin datos de Firebase al compilar, o catálogo vacío).
          En el sitio en vivo las fichas se listan desde Firestore; usá el catálogo para ver equipos.
        </p>
        <Link href="/comprar" className="font-semibold text-[#1E3A5F] underline hover:text-[#D9773F]">
          Ir al catálogo Comprar
        </Link>
      </div>
    );
  }
  const equipo = await fetchEquipoPorSlugQuery(slug);
  if (!equipo) notFound();

  const pageUrl = absolutePageUrl(equipo.slug);
  const jsonLd = buildProductJsonLd(equipo, pageUrl.startsWith('http') ? pageUrl : '');
  const canonicalPath = `/comprar/${equipo.slug}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EquipoDetalle equipo={equipo} canonicalPath={canonicalPath} />
    </>
  );
}
