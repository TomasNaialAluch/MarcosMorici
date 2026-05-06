'use client';

interface CatalogoFiltrosDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function CatalogoFiltrosDrawer({ open, onClose, children }: CatalogoFiltrosDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cerrar filtros" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-[min(100%,320px)] bg-white shadow-xl overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1E3A5F] uppercase">Filtrar por</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-[#5A6C7D] hover:text-[#1E3A5F]"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
