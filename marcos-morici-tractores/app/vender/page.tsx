import { Suspense } from 'react';
import VenderPage from '@/components/vender/VenderPage';

export default function VenderRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center px-4 text-[#5A6C7D]">
          Cargando…
        </div>
      }
    >
      <VenderPage />
    </Suspense>
  );
}
