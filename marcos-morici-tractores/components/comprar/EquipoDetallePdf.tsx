'use client';

interface EquipoDetallePdfProps {
  url: string;
  titulo: string;
  /** `compact`: enlace estilo ficha Vialmaq en columna de texto; `full`: tarjeta con vista embebida si es PDF. */
  variant?: 'full' | 'compact';
}

function isLikelyPdf(u: string): boolean {
  const lower = u.split('?')[0]?.toLowerCase() ?? '';
  return lower.endsWith('.pdf');
}

export default function EquipoDetallePdf({ url, titulo, variant = 'full' }: EquipoDetallePdfProps) {
  const pdf = isLikelyPdf(url);

  if (variant === 'compact') {
    return (
      <section className="space-y-3 pt-2 border-t border-[#E0E5E9]" aria-labelledby="equipo-pdf-heading">
        <p id="equipo-pdf-heading" className="text-sm font-semibold italic text-[#1E3A5F] tracking-tight">
          VER CARACTERÍSTICAS TÉCNICAS EN EL FOLLETO
        </p>
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0d9488] hover:text-[#0f766e]"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0d9488] text-[#0d9488]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v12M8 13l4 4 4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Descargar
        </a>
        {pdf ? (
          <p className="text-xs text-[#8A9BA8]">También podés abrir el PDF en una nueva pestaña desde el enlace.</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[#E0E5E9] bg-white overflow-hidden" aria-labelledby="equipo-pdf-heading-full">
      <div className="px-4 py-3 border-b border-[#E0E5E9] bg-[#F8FAFB] flex flex-wrap items-center justify-between gap-3">
        <h2 id="equipo-pdf-heading-full" className="text-base font-bold text-[#1E3A5F] uppercase">
          Documentación PDF
        </h2>
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline"
        >
          Descargar
        </a>
      </div>
      {pdf ? (
        <div className="bg-[#5A6C7D]/10 min-h-[480px] lg:min-h-[560px]">
          <iframe title={`PDF — ${titulo}`} src={url} className="w-full h-[min(70vh,640px)] border-0" />
        </div>
      ) : (
        <p className="p-4 text-sm text-[#5A6C7D]">
          El archivo no tiene extensión <code className="text-xs bg-[#F0F3F6] px-1 rounded">.pdf</code> reconocida; usá
          «Descargar» para abrirlo o guardarlo.
        </p>
      )}
    </section>
  );
}
