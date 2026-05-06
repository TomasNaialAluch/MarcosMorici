'use client';

import { useState } from 'react';
import Image from 'next/image';

interface EquipoDetalleGaleriaProps {
  titulo: string;
  imagenes: string[];
}

export default function EquipoDetalleGaleria({ titulo, imagenes }: EquipoDetalleGaleriaProps) {
  const imgs = imagenes.length ? imagenes : ['/logo/Logo Nav Bar.png'];
  const [idx, setIdx] = useState(0);
  const main = imgs[idx] ?? imgs[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F0F3F6] border border-[#E0E5E9]">
        <Image src={main} alt={titulo} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" unoptimized />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-colors ${
                i === idx ? 'border-[#1E3A5F] ring-2 ring-[#1E3A5F]/20' : 'border-[#E0E5E9] hover:border-[#4A7C59]'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === idx ? 'true' : undefined}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
