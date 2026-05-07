'use client';

import { useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import VenderLeadForm from '@/components/vender/VenderLeadForm';
import VenderSimpleLeadForm from '@/components/vender/VenderSimpleLeadForm';
import { useAuth } from '@/components/account/providers/AuthProvider';

export default function VenderPage() {
  const { loading, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('solicitud');

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Vender' }]} />
      <div className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A5F] uppercase tracking-tight mb-3">Vender</h1>
          {loading ? (
            <p className="text-lg text-[#5A6C7D]">Cargando…</p>
          ) : isAdmin ? (
            <p className="text-lg text-[#5A6C7D] leading-relaxed">
              Formulario completo para cargar la ficha en el catálogo: identificación, precio, ficha técnica, folleto e
              imágenes. Si abrís una solicitud desde el panel de cuenta, los datos del usuario se precargan para que
              completes y registres el lead.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-lg text-[#5A6C7D] leading-relaxed">
                Enviá una solicitud con los datos básicos y fotos. No hace falta crear una cuenta: solo completá el
                formulario con tu nombre y celular de contacto. Un administrador revisará la información y publicará la
                máquina en el catálogo cuando corresponda.
              </p>
              <p className="text-sm text-[#8A9BA8]">
                Al enviar, se usa una sesión técnica anónima solo para adjuntar archivos de forma segura (podés ignorarlo;
                no publicamos tu identidad en el sitio).
              </p>
            </div>
          )}
        </header>

        {!loading && isAdmin ? <VenderLeadForm solicitudId={solicitudId} /> : null}
        {!loading && !isAdmin ? <VenderSimpleLeadForm /> : null}
      </div>
    </div>
  );
}
