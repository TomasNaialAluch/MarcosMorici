'use client';

type CatalogoDualRangeProps = {
  min: number;
  max: number;
  low: number;
  high: number;
  step?: number;
  disabled?: boolean;
  onChange: (low: number, high: number) => void;
  format: (v: number) => string;
};

export default function CatalogoDualRange({
  min,
  max,
  low,
  high,
  step = 1,
  disabled,
  onChange,
  format,
}: CatalogoDualRangeProps) {
  const lo = Math.min(low, high);
  const hi = Math.max(low, high);
  const span = Math.max(max - min, 1e-9);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  if (min >= max) {
    return <p className="text-xs text-[#5A6C7D]">Sin variación en el catálogo.</p>;
  }

  const setLo = (v: number) => {
    const x = Math.min(Math.max(v, min), max);
    if (x <= hi) onChange(x, hi);
    else onChange(hi, x);
  };

  const setHi = (v: number) => {
    const x = Math.min(Math.max(v, min), max);
    if (x >= lo) onChange(lo, x);
    else onChange(x, lo);
  };

  return (
    <div className={`select-none py-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="mb-2 flex justify-between gap-2 text-xs text-[#5A6C7D]">
        <span className="min-w-0 truncate">{format(lo)}</span>
        <span className="min-w-0 truncate text-right">{format(hi)}</span>
      </div>
      <div className="relative mx-0.5 h-8">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#E0E5E9]" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#4A7C59]/60"
          style={{ left: `${loPct}%`, width: `${Math.max(hiPct - loPct, 0.5)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={lo}
          onChange={(e) => setLo(Number(e.target.value))}
          className="catalogo-range-thumb absolute inset-x-0 top-0 z-[2] h-8 w-full cursor-pointer"
          aria-label="Valor mínimo del rango"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={hi}
          onChange={(e) => setHi(Number(e.target.value))}
          className="catalogo-range-thumb absolute inset-x-0 top-0 z-[3] h-8 w-full cursor-pointer"
          aria-label="Valor máximo del rango"
        />
      </div>
    </div>
  );
}
