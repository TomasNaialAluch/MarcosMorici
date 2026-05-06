import type { Equipo } from '@/lib/types/equipo';

/** JSON-LD Product + Offer (README_SEO §4 — rich results cuando los datos son fiables). */
export function buildProductJsonLd(equipo: Equipo, pageUrl: string): Record<string, unknown> {
  const name = (equipo.titulo || `${equipo.marca} ${equipo.modelo}`).trim();
  const images = equipo.imagenes.filter((u) => typeof u === 'string' && u.length > 0);

  const hasListedPrice = equipo.precio != null && !equipo.precioConsultar;

  const offers: Record<string, unknown> = hasListedPrice
    ? {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: String(equipo.precio),
        availability: 'https://schema.org/InStock',
      }
    : {
        '@type': 'Offer',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        description: 'Precio a consultar con el vendedor.',
      };

  if (pageUrl.startsWith('http')) {
    (offers as Record<string, string>).url = pageUrl;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: equipo.descripcion?.slice(0, 5000) || undefined,
    image: images.length ? images : undefined,
    brand: { '@type': 'Brand', name: equipo.marca },
    sku: equipo.slug,
    category: equipo.categoria,
    offers,
  };
}
