import { redirect } from 'next/navigation';

type PageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

/** Compatibilidad: enlaces viejos a `/registro` van a la página unificada `/acceso`. */
export default async function RegistroPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = new URLSearchParams({ tab: 'registro' });
  if (sp.redirect) q.set('redirect', sp.redirect);
  redirect(`/acceso?${q.toString()}`);
}
