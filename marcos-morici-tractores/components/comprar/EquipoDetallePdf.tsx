'use client';

interface EquipoDetallePdfProps {
  url: string;
  titulo: string;
}

function isLikelyPdf(u: string): boolean {
  const lower = u.split('?')[0]?.toLowerCase() ?? '';
  return lower.endsWith('.pdf');
}

export default function EquipoDetallePdf({ url, titulo }: EquipoDetallePdfProps) {
  const pdf = isLikelyPdf(url);

  return (
    <section className="rounded-xl border border-[#E0E5E9] bg-white overflow-hidden" aria-labelledby="equipo-pdf-heading">
      <div className="px-4 py-3 border-b border-[#E0E5E9] bg-[#F8FAFB] flex flex-wrap items-center justify-between gap-3">
        <h2 id="equipo-pdf-heading" className="text-base font-bold text-[#1E3A5F] uppercase">
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
