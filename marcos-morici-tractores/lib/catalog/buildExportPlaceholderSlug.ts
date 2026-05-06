/**
 * Slug sintético para `generateStaticParams` cuando no hay equipos en build.
 * Con `output: 'export'`, Next.js exige al menos un param; no debe existir en Firestore.
 */
export const BUILD_EXPORT_PLACEHOLDER_SLUG = '__mmt_sin_equipos_en_build__';

export function isBuildExportPlaceholderSlug(slug: string): boolean {
  return slug === BUILD_EXPORT_PLACEHOLDER_SLUG;
}
