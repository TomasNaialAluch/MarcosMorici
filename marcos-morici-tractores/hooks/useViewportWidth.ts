'use client';

import { useEffect, useState } from 'react';

/**
 * Ancho interior del viewport en px. En SSR / primer paint usa `fallback` hasta montar.
 * Se actualiza en `resize` (ligero debounce).
 */
export function useViewportWidth(fallback = 1024): number {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const read = () => setWidth(window.innerWidth);
    read();
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(read, 64);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      if (t) clearTimeout(t);
    };
  }, []);

  return width;
}
