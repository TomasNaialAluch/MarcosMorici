import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchEquiposPublicados, fetchEquipoPorSlugQuery } from '@/lib/firebase/equipos';
import EquipoDetalle from '@/components/comprar/EquipoDetalle';
import { buildProductJsonLd } from '@/lib/seo/productJsonLd';

type Props = { params: Promise<{ slug: string }> };

/** Requerido con `output: 'export'`: rutas de ficha generadas en build (README_SEO — URLs estables). */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const equipos = await fetchEquiposPublicados();
    return equipos.map((e) => ({ slug: e.slug }));
  } catch {
    return [];
  }
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
