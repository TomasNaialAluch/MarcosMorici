'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/account/providers/AuthProvider';
import { listPendingVenderSolicitudes, type VenderSolicitudDoc } from '@/lib/firebase/venderSolicitudes';

function waDigits(s: string): string {
  return s.replace(/\D/g, '');
}

function whatsappHref(celular: string): string {
  const d = waDigits(celular);
  if (!d) return '#';
  const withCc = d.startsWith('54') ? d : `54${d}`;
  return `https://wa.me/${withCc}`;
}

export default function SolicitudesVenderPage() {
  const { isAdmin, loading } = useAuth();
  const [items, setItems] = useState<VenderSolicitudDoc[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!isAdmin || loading) return;
    let cancelled = false;
    setLoadingList(true);
    setError(null);
    (async () => {
      try {
        const list = await listPendingVenderSolicitudes();
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar el listado.');
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, loading]);

  if (loading) {
    return <p className="text-[#5A6C7D]">Cargando sesión…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Solo los administradores pueden ver las solicitudes de publicación.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] uppercase tracking-tight mb-2">Solicitudes para publicar</h1>
      <p className="text-[#5A6C7D] mb-8 max-w-2xl">
        Personas que enviaron el formulario corto. Contactalas y abrí el formulario completo para cargar la ficha y el lead.
      </p>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      {loadingList ? (
        <p className="text-[#5A6C7D]">Cargando solicitudes…</p>
      ) : items.length === 0 ? (
        <p className="text-[#5A6C7D]">No hay solicitudes pendientes.</p>
      ) : (
        <ul className="space-y-6">
          {items.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-[#E0E5E9] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[#1E3A5F]">
                    {s.marca} {s.modelo}
                  </p>
                  <p className="text-xs font-mono text-[#8A9BA8] mt-1">ID {s.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={whatsappHref(s.celular)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-[#25D366] px-4 py-2 text-xs font-semibold uppercase text-white hover:bg-[#20BA5A]"
                  >
                    WhatsApp
                  </a>
                  {s.email ? (
                    <a
                      href={`mailto:${encodeURIComponent(s.email)}`}
                      className="inline-flex rounded-lg border-2 border-[#E0E5E9] px-4 py-2 text-xs font-semibold uppercase text-[#1E3A5F] hover:border-[#1E3A5F]"
                    >
                      Email
                    </a>
                  ) : null}
                  <Link
                    href={`/vender?solicitud=${encodeURIComponent(s.id)}`}
                    className="inline-flex rounded-lg bg-[#1E3A5F] px-4 py-2 text-xs font-semibold uppercase text-white hover:bg-[#D9773F]"
                  >
                    Formulario completo
                  </Link>
                </div>
              </div>

              {s.descripcion ? (
                <p className="mt-4 text-sm text-[#5A6C7D] whitespace-pre-wrap">{s.descripcion}</p>
              ) : null}

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[#8A9BA8]">Precio</dt>
                  <dd className="font-medium text-[#1E3A5F]">
                    {s.precioConsultar ? 'A consultar' : s.precio ?? '—'}{' '}
                    {!s.precioConsultar && s.moneda === 'dolar' ? 'USD' : !s.precioConsultar ? 'ARS' : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#8A9BA8]">Contacto</dt>
                  <dd className="text-[#1E3A5F]">
                    {s.nombreApellido}
                    <br />
                    {s.celular}
                    {s.email ? (
                      <>
                        <br />
                        {s.email}
                      </>
                    ) : null}
                  </dd>
                </div>
              </dl>

              {s.imagenesUrls.length || s.folletoUrl ? (
                <div className="mt-4 border-t border-[#E0E5E9] pt-4">
                  <p className="text-xs font-semibold uppercase text-[#1E3A5F] mb-2">Adjuntos del usuario</p>
                  {s.folletoUrl ? (
                    <p className="text-sm mb-2">
                      <a href={s.folletoUrl} className="text-[#4A7C59] underline break-all" target="_blank" rel="noopener noreferrer">
                        PDF / folleto
                      </a>
                    </p>
                  ) : null}
                  {s.imagenesUrls.length ? (
                    <ul className="text-xs space-y-1">
                      {s.imagenesUrls.map((url) => (
                        <li key={url}>
                          <a href={url} className="text-[#4A7C59] underline break-all" target="_blank" rel="noopener noreferrer">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
