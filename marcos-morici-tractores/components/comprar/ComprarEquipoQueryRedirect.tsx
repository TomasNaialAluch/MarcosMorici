'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirige `/comprar?equipo=slug` → `/comprar/slug` (detalle dedicado y SEO). */
export default function ComprarEquipoQueryRedirect({ slug }: { slug: string }) {
  const router = useRouter();

  useEffect(() => {
    const s = slug.trim();
    if (!s) {
      router.replace('/comprar');
      return;
    }
    router.replace(`/comprar/${encodeURIComponent(s)}`);
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <p className="text-[#5A6C7D] text-sm">Cargando ficha del equipo…</p>
    </div>
  );
}
