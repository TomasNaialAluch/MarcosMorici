/** Paginación del catálogo — alineado a README_COMPRAR_VIALMAQ §5.7 / §5.7.1 (Vialmaq). */

export const CATALOGO_PAGE_SIZE_OPTIONS = [12, 24, 36] as const;

export type CatalogoPageSize = (typeof CATALOGO_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_CATALOGO_PAGE_SIZE: CatalogoPageSize = 12;
