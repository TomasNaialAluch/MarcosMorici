'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/config';

const btnGoogle =
  'w-full flex items-center justify-center gap-2 rounded-lg border-2 border-[#E0E5E9] bg-white py-2.5 text-sm font-semibold text-[#1E3A5F] hover:bg-[#F0F3F6] transition-colors';
const btnDisabled =
  'w-full rounded-lg border border-dashed border-[#E0E5E9] bg-[#F8FAFB] py-2.5 text-xs font-medium text-[#8A9BA8] cursor-not-allowed';

type Props = {
  redirectTo: string;
};

export default function SocialAuthButtons({ redirectTo }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const signInGoogle = async () => {
    setError(null);
    const auth = getClientAuth();
    if (!auth) {
      setError('Firebase no está configurado.');
      return;
    }
    setPending(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace(redirectTo);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error con Google.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-[#5A6C7D]">
        O continuá con
      </p>
      {error && (
        <p className="text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className={btnGoogle}
        onClick={signInGoogle}
        disabled={pending}
      >
        {pending ? 'Conectando…' : 'Continuar con Google'}
      </button>
      <button type="button" className={btnDisabled} disabled title="Activá Facebook en Firebase Console → Authentication">
        Facebook (configurar en Firebase)
      </button>
      <button type="button" className={btnDisabled} disabled title="Activá Teléfono en Firebase Console → Authentication">
        SMS / teléfono (configurar en Firebase)
      </button>
    </div>
  );
}
