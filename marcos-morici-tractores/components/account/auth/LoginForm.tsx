'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { formatAuthError } from '@/lib/firebase/authFormatError';
import { getClientAuth, isFirebaseWebAppReady } from '@/lib/firebase/config';
import SocialAuthButtons from '@/components/account/auth/SocialAuthButtons';

const inputClass =
  'w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] placeholder:text-[#5A6C7D] focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]';
const btnPrimary =
  'w-full rounded-lg bg-[#1E3A5F] py-2.5 text-sm font-semibold uppercase text-white hover:bg-[#152d49] transition-colors';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/cuenta/perfil';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFirebaseWebAppReady()) {
      setError(
        'Firebase no está configurado: creá `.env.local` con NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID y NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (podés partir de `.env.example`). Reiniciá `npm run dev`.'
      );
      return;
    }
    const auth = getClientAuth();
    if (!auth) {
      setError('No se pudo iniciar la sesión en el navegador. Recargá la página e intentá de nuevo.');
      return;
    }
    setPending(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setError(formatAuthError(err, 'Error al iniciar sesión.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[#E0E5E9] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#1E3A5F]">Iniciar sesión</h1>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-[#5A6C7D]">
            Correo
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-[#5A6C7D]">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <SocialAuthButtons redirectTo={redirect} />

      <p className="text-center text-sm text-[#5A6C7D]">
        ¿No tenés cuenta?{' '}
        <Link
          href={
            (() => {
              const rp = searchParams.get('redirect');
              return rp
                ? `/acceso?tab=registro&redirect=${encodeURIComponent(rp)}`
                : '/acceso?tab=registro';
            })()
          }
          className="font-semibold text-[#1E3A5F] hover:text-[#D9773F]"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}
