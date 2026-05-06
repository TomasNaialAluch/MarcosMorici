'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/config';
import SocialAuthButtons from '@/components/account/auth/SocialAuthButtons';

const inputClass =
  'w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] placeholder:text-[#5A6C7D] focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]';
const btnPrimary =
  'w-full rounded-lg bg-[#1E3A5F] py-2.5 text-sm font-semibold uppercase text-white hover:bg-[#152d49] transition-colors';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/cuenta/perfil';
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const auth = getClientAuth();
    if (!auth) {
      setError('Firebase no está configurado (variables de entorno).');
      return;
    }
    setPending(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const name = displayName.trim();
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[#E0E5E9] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#1E3A5F]">Crear cuenta</h1>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="reg-name" className="mb-1 block text-sm font-medium text-[#5A6C7D]">
            Nombre (opcional)
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            className={inputClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Cómo te mostramos en consultas"
          />
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-[#5A6C7D]">
            Correo
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-[#5A6C7D]">
            Contraseña
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="mb-1 block text-sm font-medium text-[#5A6C7D]">
            Repetir contraseña
          </label>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>

      <SocialAuthButtons redirectTo={redirect} />

      <p className="text-center text-sm text-[#5A6C7D]">
        ¿Ya tenés cuenta?{' '}
        <Link
          href={
            (() => {
              const rp = searchParams.get('redirect');
              return rp
                ? `/acceso?tab=ingresar&redirect=${encodeURIComponent(rp)}`
                : '/acceso?tab=ingresar';
            })()
          }
          className="font-semibold text-[#1E3A5F] hover:text-[#D9773F]"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
