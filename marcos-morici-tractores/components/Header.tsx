'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ExpandableSearch from '@/components/ExpandableSearch';
import HeaderAccount from '@/components/account/layout/HeaderAccount';
import './Header.css';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<'hidden' | 'animating' | 'visible'>('hidden');

  const navLinkClass = (path: string, matchPrefix?: boolean) => {
    const active = matchPrefix
      ? pathname === path || pathname.startsWith(`${path}/`)
      : pathname === path;
    return `font-semibold uppercase text-base md:text-lg transition-colors header-link ${
      active
        ? 'text-[#1E3A5F] border-b-[3px] border-[#4A7C59] pb-0.5 md:pb-1'
        : 'text-[#1E3A5F] border-b-[3px] border-transparent hover:text-[#4A7C59] pb-0.5 md:pb-1'
    }`;
  };

  useEffect(() => {
    // Secuencia: loader (7s) + fade (0.5s) -> animacion navbar -> estado final estable.
    const startAnimation = window.setTimeout(() => {
      setPhase('animating');
    }, 7600);

    // Mantener estado animating el tiempo suficiente para que termine:
    // barra blanca + animacion secuencial de links.
    const settleHeader = window.setTimeout(() => {
      setPhase('visible');
    }, 13600);

    return () => {
      window.clearTimeout(startAnimation);
      window.clearTimeout(settleHeader);
    };
  }, []);

  return (
    <header className={`w-full header-${phase}`}>
      {/* Barra superior azul oscura */}
      <div className="bg-[#1E3A5F] text-white px-4 navbar-blue-bar">
        <div className="container mx-auto flex items-center justify-center md:justify-start relative min-h-[96px]">
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity header-logo-animate"
          >
            <div className="bg-white rounded-lg px-3 shadow-sm">
              {/* Logo Desktop */}
              <Image
                src="/logo/Logo Nav Bar.png"
                alt="Marcos Morici Tractores"
                width={440}
                height={100}
                className="h-24 w-auto object-contain hidden md:block"
                unoptimized
              />
              {/* Logo Mobile */}
              <Image
                src="/logo/Logo Mobile.png"
                alt="Marcos Morici Tractores"
                width={440}
                height={100}
                className="h-24 w-auto object-contain block md:hidden"
                unoptimized
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Barra de navegación blanca con links */}
      <nav className="bg-white border-b border-[#E0E5E9] navbar-white">
        <div className="container mx-auto px-4">
          {/* Mobile: columna (links centrados + buscador abajo). Desktop: fila (links izq + buscador der) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-0 md:h-16 gap-4 md:gap-6 w-full">
            <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8 header-links-container md:ml-[9%]">
              <Link
                href="/comprar"
                className={navLinkClass('/comprar', true)}
                data-delay="0"
              >
                Comprar
              </Link>
              <Link
                href="/vender"
                className={navLinkClass('/vender')}
                data-delay="1"
              >
                Vender
              </Link>
              <Link
                href="/nosotros"
                className={navLinkClass('/nosotros')}
                data-delay="2"
              >
                Nosotros
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:flex-1 md:justify-end header-search-wrap">
                <HeaderAccount />
                <ExpandableSearch
                  placeholder="¿Qué estás buscando?"
                  ariaLabel="Buscar en catálogo"
                  onSearch={(q) => router.push(`/comprar?q=${encodeURIComponent(q)}`)}
                />
              </div>
          </div>
        </div>
      </nav>
    </header>
  );
}