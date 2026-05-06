'use client';

import { useAuth } from '@/components/account/providers/AuthProvider';

export default function MensajesPanel() {
  const { isAdmin, profile, firebaseUser } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1E3A5F]">Mensajes</h1>
        <p className="mt-1 text-sm text-[#5A6C7D]">
          {isAdmin
            ? 'Como administrador podés ver todas las conversaciones del sitio cuando esté activa la colección en Firestore.'
            : 'Acá verás las conversaciones vinculadas a tus consultas o publicaciones.'}
        </p>
      </div>

      <div className="rounded-lg border border-[#E0E5E9] bg-[#F8FAFB] p-6 text-sm text-[#5A6C7D]">
        <p className="font-semibold text-[#1E3A5F] mb-2">Próximo paso (backend)</p>
        <p>
          El modelo de datos está descrito en <code className="text-xs bg-white px-1 rounded border">README_DATABASE.md</code>{' '}
          (colección <code className="text-xs bg-white px-1 rounded border">conversaciones</code>, mensajes con{' '}
          <code className="text-xs bg-white px-1 rounded border">senderRole</code>). Esta pantalla listará hilos reales
          cuando existan reglas y documentos.
        </p>
      </div>

      <ul className="rounded-lg border border-dashed border-[#E0E5E9] bg-white p-4 text-sm text-[#8A9BA8]">
        <li>
          Sesión: <span className="text-[#1E3A5F] font-medium">{firebaseUser?.email ?? '—'}</span>
        </li>
        <li>
          Rol en base de datos:{' '}
          <span className="text-[#1E3A5F] font-medium">{profile?.role === 'admin' ? 'admin' : 'user'}</span>
        </li>
      </ul>
    </div>
  );
}
