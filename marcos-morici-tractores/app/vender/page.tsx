import Breadcrumb from '@/components/Breadcrumb';

export default function Vender() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Vender' }]} />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#1E3A5F] uppercase mb-4">
          Vender
        </h1>
        <p className="text-lg text-[#5A6C7D]">
          Página en construcción
        </p>
      </div>
    </div>
  );
}
