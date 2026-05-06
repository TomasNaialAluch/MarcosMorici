'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import LoginForm from '@/components/account/auth/LoginForm';
import RegisterForm from '@/components/account/auth/RegisterForm';

const tabBtn =
  'flex-1 rounded-lg py-3 text-sm font-bold uppercase transition-colors border-2 border-transparent';
const tabActive = 'bg-[#1E3A5F] text-white border-[#1E3A5F]';
const tabInactive =
  'bg-white text-[#1E3A5F] border-[#E0E5E9] hover:border-[#1E3A5F]/40';

function AccesoInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'registro' ? 'registro' : 'ingresar';
  const redirect = searchParams.get('redirect') ?? '';

  const qsIngresar = useMemo(() => {
    const p = new URLSearchParams();
    p.set('tab', 'ingresar');
    if (redirect) p.set('redirect', redirect);
    return p.toString();
  }, [redirect]);

  const qsRegistro = useMemo(() => {
    const p = new URLSearchParams();
    p.set('tab', 'registro');
    if (redirect) p.set('redirect', redirect);
    return p.toString();
  }, [redirect]);

  return (
    <div className="max-w-lg mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Ingresar o registrarse</h1>
        <p className="mt-2 text-sm text-[#5A6C7D]">
          Elegí si ya tenés cuenta o si querés crear una nueva.
        </p>
      </header>

      <div className="mb-6 flex gap-2 rounded-xl bg-[#E8F4F8] p-1">
        <Link
          href={`/acceso?${qsIngresar}`}
          className={`${tabBtn} text-center ${tab === 'ingresar' ? tabActive : tabInactive}`}
          aria-current={tab === 'ingresar' ? 'page' : undefined}
        >
          Ingresar
        </Link>
        <Link
          href={`/acceso?${qsRegistro}`}
          className={`${tabBtn} text-center ${tab === 'registro' ? tabActive : tabInactive}`}
          aria-current={tab === 'registro' ? 'page' : undefined}
        >
          Registrarse
        </Link>
      </div>

      {tab === 'ingresar' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}

function AccesoFallback() {
  return (
    <div className="max-w-lg mx-auto py-12 flex justify-center">
      <p className="text-[#5A6C7D]">Cargando…</p>
    </div>
  );
}

export default function AccesoClient() {
  return (
    <Suspense fallback={<AccesoFallback />}>
      <AccesoInner />
    </Suspense>
  );
}
