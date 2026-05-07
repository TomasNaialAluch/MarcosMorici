'use client';

import { Suspense } from 'react';
import { useSearchParams, useParams, usePathname } from 'next/navigation';
import CatalogoClient from '@/components/comprar/CatalogoClient';
import EquipoDetalleLoader from '@/components/comprar/EquipoDetalleLoader';

function ComprarCatalogFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="h-32 w-full max-w-2xl rounded-lg bg-[#F0F3F6] animate-pulse" />
    </div>
  );
}

function ComprarCatalogInner() {
  const sp = useSearchParams();
  const params = useParams<{ slug?: string[] }>();
  const pathname = usePathname();
  const q = sp.get('q') ?? '';
  const equipoQuery = (sp.get('equipo') ?? '').trim();

  const slugFromParams = params.slug?.[0];
  const slugFromPath = pathname.match(/^\/comprar\/([^/]+)\/?$/)?.[1];
  const pathSlug = slugFromParams ?? slugFromPath;

  if (equipoQuery) {
    return <EquipoDetalleLoader slug={equipoQuery} />;
  }
  if (pathSlug) {
    return <EquipoDetalleLoader slug={decodeURIComponent(pathSlug)} />;
  }
  return <CatalogoClient initialSearch={q} />;
}

export default function ComprarRouter() {
  return (
    <Suspense fallback={<ComprarCatalogFallback />}>
      <ComprarCatalogInner />
    </Suspense>
  );
}
