import Link from 'next/link';
import RequireAdmin from '@/components/account/cuenta/RequireAdmin';

export default function CuentaMensajesPage() {
  return (
    <RequireAdmin>
      <div className="max-w-lg space-y-4">
        <h1 className="text-xl font-bold text-[#1E3A5F] uppercase tracking-tight">Mensajes</h1>
        <p className="text-sm text-[#5A6C7D] leading-relaxed">
          El contacto con clientes ya no se gestiona por mensajes dentro de la plataforma. Usá las vías acordadas con el
          cliente (por ejemplo WhatsApp o teléfono en cada publicación).
        </p>
        <Link
          href="/cuenta/perfil"
          className="inline-flex text-sm font-semibold text-[#1E3A5F] underline hover:text-[#D9773F]"
        >
          ← Volver a cuenta
        </Link>
      </div>
    </RequireAdmin>
  );
}
