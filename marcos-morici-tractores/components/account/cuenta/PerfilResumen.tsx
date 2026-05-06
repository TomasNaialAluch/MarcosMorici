'use client';

import { useAuth } from '@/components/account/providers/AuthProvider';

export default function PerfilResumen() {
  const { firebaseUser, profile, profileError, signOut, isAdmin } = useAuth();

  const name = profile?.displayName || firebaseUser?.displayName || '—';
  const email = profile?.email || firebaseUser?.email || '—';

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1E3A5F]">Tu perfil</h1>
        <p className="mt-1 text-sm text-[#5A6C7D]">Datos de sesión y rol asignado en Firestore.</p>
      </div>

      {profileError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {profileError} — revisá reglas de lectura de la colección <code>users</code> en Firebase.
        </p>
      )}

      <dl className="rounded-lg border border-[#E0E5E9] bg-white divide-y divide-[#E0E5E9]">
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between gap-1">
          <dt className="text-xs font-semibold uppercase text-[#5A6C7D]">Nombre</dt>
          <dd className="text-[#1E3A5F] font-medium">{name}</dd>
        </div>
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between gap-1">
          <dt className="text-xs font-semibold uppercase text-[#5A6C7D]">Correo</dt>
          <dd className="text-[#1E3A5F] font-medium break-all">{email}</dd>
        </div>
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <dt className="text-xs font-semibold uppercase text-[#5A6C7D]">Rol</dt>
          <dd>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${
                isAdmin ? 'bg-[#1E3A5F] text-white' : 'bg-[#E8F4F8] text-[#1E3A5F]'
              }`}
            >
              {isAdmin ? 'Administrador' : 'Usuario'}
            </span>
            <p className="mt-2 text-xs text-[#5A6C7D]">
              Los administradores se habilitan editando <code className="bg-[#F0F3F6] px-1 rounded">role: &quot;admin&quot;</code> en el
              documento <code className="bg-[#F0F3F6] px-1 rounded">users/&lt;uid&gt;</code> (solo desde consola o script con permisos).
            </p>
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-lg border-2 border-[#1E3A5F] px-5 py-2 text-sm font-semibold uppercase text-[#1E3A5F] hover:bg-[#F0F3F6] transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
