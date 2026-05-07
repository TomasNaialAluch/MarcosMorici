'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tab = (href: string, label: string, pathname: string) => {
  const active =
    href === '/cuenta/perfil'
      ? pathname === '/cuenta/perfil' || pathname === '/cuenta'
      : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`rounded-lg px-4 py-2 text-sm font-semibold uppercase transition-colors ${
        active
          ? 'bg-[#1E3A5F] text-white'
          : 'text-[#1E3A5F] border border-[#E0E5E9] bg-white hover:bg-[#F0F3F6]'
      }`}
    >
      {label}
    </Link>
  );
};

export default function CuentaTabs() {
  const pathname = usePathname() ?? '';

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[#E0E5E9] pb-4" aria-label="Secciones de cuenta">
      {tab('/cuenta/perfil', 'Perfil', pathname)}
      {tab('/cuenta/publicaciones', 'Publicaciones', pathname)}
      {tab('/cuenta/mensajes', 'Mensajes', pathname)}
    </nav>
  );
}
