'use client';

import { useMemo } from 'react';
import type { VenderFormState } from '@/lib/types/venderLead';
import { computeVenderFormProgress } from '@/lib/vender/formProgress';

interface VenderFormProgressProps {
  state: VenderFormState;
}

export default function VenderFormProgress({ state }: VenderFormProgressProps) {
  const { groups, percent } = useMemo(() => computeVenderFormProgress(state), [state]);

  return (
    <div
      className="rounded-xl border border-[#E0E5E9] bg-[#F8FAFB] px-4 py-4 sm:px-5 sm:py-4 mb-6"
      aria-label="Progreso del formulario"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-sm font-semibold text-[#1E3A5F]">Completitud del aviso</p>
        <span className="text-sm font-bold tabular-nums text-[#4A7C59]">{percent}%</span>
      </div>
      <div
        className="h-2 rounded-full bg-[#E0E5E9] overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#4A7C59] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 text-xs text-[#5A6C7D]">
        {groups.map((g) => {
          const done = g.filled >= g.total;
          const partial = g.filled > 0 && !done;
          return (
            <li key={g.id} className="flex items-center gap-2 min-w-0">
              <span
                className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done
                    ? 'bg-[#4A7C59] text-white'
                    : partial
                      ? 'bg-[#D9773F]/25 text-[#D9773F] border border-[#D9773F]/50'
                      : 'bg-white border border-[#E0E5E9] text-[#8A9BA8]'
                }`}
                aria-hidden
              >
                {done ? '✓' : partial ? '·' : ''}
              </span>
              <span className="truncate">
                <span className="font-medium text-[#1E3A5F]">{g.label}</span>
                <span className="text-[#8A9BA8]">
                  {' '}
                  ({g.filled}/{g.total})
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-[#8A9BA8] leading-snug">
        Ningún campo es obligatorio. El porcentaje solo refleja cuánta información ya cargaste para la ficha del equipo.
      </p>
    </div>
  );
}
