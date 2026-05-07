'use client';

import Breadcrumb from '@/components/Breadcrumb';
import VenderLeadForm from '@/components/vender/VenderLeadForm';

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Vender' }]} />
      <div className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A5F] uppercase tracking-tight mb-3">Vender</h1>
          <p className="text-lg text-[#5A6C7D] leading-relaxed">
            Cargá los datos de tu equipo para la ficha pública: identificación, precio, ficha técnica, folleto e
            imágenes. Ningún campo es obligatorio; el indicador arriba del formulario muestra cuánto completaste. En el
            segundo paso podés dejar tus datos de contacto.
          </p>
        </header>
        <VenderLeadForm />
      </div>
    </div>
  );
}
