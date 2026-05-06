'use client';

import Breadcrumb from '@/components/Breadcrumb';
import VenderLeadForm from '@/components/vender/VenderLeadForm';

export default function VenderPage() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Vender' }]} />
      <div className="container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A5F] uppercase tracking-tight mb-3">Vender</h1>
          <p className="text-lg text-[#5A6C7D] leading-relaxed">
            Completá el formulario con los datos de tu equipo. Es el mismo enfoque que usa el sector en sitios de
            referencia: primero la máquina, después tu contacto.
          </p>
        </header>
        <VenderLeadForm />
      </div>
    </div>
  );
}
