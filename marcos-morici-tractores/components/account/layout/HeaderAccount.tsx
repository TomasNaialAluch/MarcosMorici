'use client';

import Link from 'next/link';
import { useAuth } from '@/components/account/providers/AuthProvider';

const linkClass =
  'font-semibold uppercase text-sm text-[#1E3A5F] border-b-2 border-transparent hover:text-[#4A7C59] hover:border-[#4A7C59] pb-0.5 transition-colors';
const btnOut =
  'text-xs font-bold uppercase text-[#5A6C7D] hover:text-[#1E3A5F] underline-offset-2 hover:underline';

export default function HeaderAccount() {
  const { firebaseUser, loading, signOut } = useAuth();

  if (loading) {
    return <span className="text-[#1E3A5F] text-sm tabular-nums opacity-50">···</span>;
  }

  if (firebaseUser) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
        <Link href="/cuenta/publicaciones" className={linkClass}>
          Publicaciones
        </Link>
        <Link href="/cuenta/mensajes" className={linkClass}>
          Mensajes
        </Link>
        <Link href="/cuenta/perfil" className={linkClass}>
          Mi cuenta
        </Link>
        <button type="button" onClick={() => void signOut()} className={btnOut}>
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-end">
      <Link href="/acceso" className={linkClass}>
        Ingresar o registrarse
      </Link>
    </div>
  );
}
