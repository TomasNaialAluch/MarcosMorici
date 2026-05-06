'use client';

interface CatalogoBusquedaFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CatalogoBusquedaField({ value, onChange }: CatalogoBusquedaFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#5A6C7D] mb-1">Buscar en catálogo</label>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="¿Qué estás buscando?"
        className="w-full max-w-md border border-[#E0E5E9] rounded-lg px-4 py-2.5 text-[#1E3A5F] placeholder:text-[#5A6C7D]"
      />
    </div>
  );
}
