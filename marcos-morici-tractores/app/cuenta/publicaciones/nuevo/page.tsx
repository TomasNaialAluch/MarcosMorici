'use client';

import Link from 'next/link';
import { useAuth } from '@/components/account/providers/AuthProvider';
import MisEquipoForm from '@/components/account/publicaciones/MisEquipoForm';

export default function NuevaPublicacionPage() {
  const { firebaseUser } = useAuth();
  if (!firebaseUser) return null;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/cuenta/publicaciones" className="text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline">
          ← Mis publicaciones
        </Link>
        <h1 className="mt-4 text-xl font-bold text-[#1E3A5F]">Nueva publicación</h1>
        <p className="mt-1 text-sm text-[#5A6C7D]">
          Los datos se guardan en Firestore y las fotos en Storage (carpeta <code className="text-xs bg-[#F0F3F6] px-1 rounded">user_equipos/…</code>).
        </p>
      </div>
      <MisEquipoForm mode="create" ownerUid={firebaseUser.uid} />
    </div>
  );
}
