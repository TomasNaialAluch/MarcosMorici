'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CatalogoClient from '@/components/comprar/CatalogoClient';
import ComprarEquipoQueryRedirect from '@/components/comprar/ComprarEquipoQueryRedirect';

function ComprarCatalogInner() {
  const sp = useSearchParams();
  const q = sp.get('q') ?? '';
  const equipo = sp.get('equipo') ?? '';
  if (equipo.trim()) {
    return <ComprarEquipoQueryRedirect slug={equipo} />;
  }
  return <CatalogoClient initialSearch={q} />;
}

function CatalogoFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="h-32 w-full max-w-2xl rounded-lg bg-[#F0F3F6] animate-pulse" />
    </div>
  );
}

export default function ComprarPage() {
  return (
    <Suspense fallback={<CatalogoFallback />}>
      <ComprarCatalogInner />
    </Suspense>
  );
}
