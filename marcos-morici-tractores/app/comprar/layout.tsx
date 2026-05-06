import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comprar equipos | Marcos Morici Tractores',
  description:
    'Catálogo de maquinaria en venta. Filtrá por categoría, marca, precio y año. Consultanos por WhatsApp para asesoramiento.',
};

export default function ComprarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
