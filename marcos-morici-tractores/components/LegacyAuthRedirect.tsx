'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LegacyAuthRedirectInner({ tab }: { tab: 'ingresar' | 'registro' }) {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const q = new URLSearchParams({ tab });
    const r = sp.get('redirect');
    if (r) q.set('redirect', r);
    router.replace(`/acceso?${q.toString()}`);
  }, [router, sp, tab]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-[#5A6C7D] text-sm">
      Redirigiendo…
    </div>
  );
}

/** Redirección compatible con `output: 'export'` (sin `searchParams` en servidor). */
export default function LegacyAuthRedirect({ tab }: { tab: 'ingresar' | 'registro' }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-[#5A6C7D] text-sm">
          Cargando…
        </div>
      }
    >
      <LegacyAuthRedirectInner tab={tab} />
    </Suspense>
  );
}
