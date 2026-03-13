import { useEffect } from 'react';

/**
 * Ejecuta un callback cuando se hace click fuera del elemento referenciado.
 * Útil para cerrar dropdowns, modales o inputs expandibles.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, handler, isActive]);
}
