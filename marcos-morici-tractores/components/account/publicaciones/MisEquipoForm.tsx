'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { CATALOGO_CATEGORIAS_ORDEN } from '@/lib/catalog/catalogUtils';
import type { Equipo } from '@/lib/types/equipo';
import {
  createMisEquipo,
  updateMisEquipo,
  type MisEquipoInput,
} from '@/lib/firebase/misEquipos';

const inputClass =
  'w-full rounded-lg border border-[#E0E5E9] px-3 py-2.5 text-sm text-[#1E3A5F] placeholder:text-[#5A6C7D] focus:border-[#4A7C59] focus:outline-none focus:ring-1 focus:ring-[#4A7C59]';
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#1E3A5F] px-6 py-2.5 text-sm font-semibold uppercase text-white hover:bg-[#152d49] transition-colors disabled:opacity-50';
const btnGhost =
  'inline-flex items-center justify-center rounded-lg border-2 border-[#E0E5E9] px-5 py-2 text-sm font-semibold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors';

function parseIntOpt(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseFloatOpt(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

type Props =
  | { mode: 'create'; ownerUid: string }
  | { mode: 'edit'; ownerUid: string; equipoId: string; initial: Equipo };

export default function MisEquipoForm(props: Props) {
  const router = useRouter();
  const initial = props.mode === 'edit' ? props.initial : null;

  const [marca, setMarca] = useState(initial?.marca ?? '');
  const [modelo, setModelo] = useState(initial?.modelo ?? '');
  const [titulo, setTitulo] = useState(initial?.titulo ?? '');
  const [ano, setAno] = useState(initial?.ano != null ? String(initial.ano) : '');
  const [horas, setHoras] = useState(initial?.horas != null ? String(initial.horas) : '');
  const [precio, setPrecio] = useState(
    initial?.precioConsultar ? '' : initial?.precio != null ? String(initial.precio) : ''
  );
  const [precioConsultar, setPrecioConsultar] = useState(Boolean(initial?.precioConsultar));
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '');
  const [categoria, setCategoria] = useState(initial?.categoria ?? '');
  const [publicado, setPublicado] = useState(initial?.publicado !== false);
  const [urlsText, setUrlsText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [imagenesUrls, setImagenesUrls] = useState<string[]>(initial?.imagenes ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const categorias = useMemo(() => [...CATALOGO_CATEGORIAS_ORDEN], []);

  const buildInput = useCallback((): MisEquipoInput | { error: string } => {
    const urlExtras = urlsText
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http'));
    const imgs = [...imagenesUrls, ...urlExtras];
    if (imgs.length === 0 && files.length === 0) {
      return { error: 'Agregá al menos una imagen (archivo o URL https).' };
    }
    return {
      marca,
      modelo,
      titulo: titulo.trim() || undefined,
      ano: parseIntOpt(ano),
      horas: parseIntOpt(horas),
      precio: precioConsultar ? undefined : parseFloatOpt(precio),
      precioConsultar,
      descripcion: descripcion.trim() || undefined,
      categoria: categoria.trim() || undefined,
      publicado,
      imagenes: imgs,
    };
  }, [
    marca,
    modelo,
    titulo,
    ano,
    horas,
    precio,
    precioConsultar,
    descripcion,
    categoria,
    publicado,
    imagenesUrls,
    urlsText,
    files,
  ]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const built = buildInput();
    if ('error' in built) {
      setError(built.error);
      return;
    }
    setPending(true);
    try {
      if (props.mode === 'create') {
        const r = await createMisEquipo(props.ownerUid, built, files);
        if (!r.ok) setError(r.error);
        else router.replace('/cuenta/publicaciones');
      } else {
        const r = await updateMisEquipo(props.ownerUid, props.equipoId, built, files);
        if (!r.ok) setError(r.error);
        else router.replace('/cuenta/publicaciones');
      }
    } finally {
      setPending(false);
    }
  };

  const removeUrl = (u: string) => {
    setImagenesUrls((prev) => prev.filter((x) => x !== u));
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Marca</label>
          <input className={inputClass} value={marca} onChange={(e) => setMarca(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Modelo</label>
          <input className={inputClass} value={modelo} onChange={(e) => setModelo(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Título (opcional)</label>
        <input
          className={inputClass}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Si lo dejás vacío, usamos marca + modelo"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Categoría</label>
        <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Elegir…</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Año</label>
          <input className={inputClass} inputMode="numeric" value={ano} onChange={(e) => setAno(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Horas</label>
          <input className={inputClass} inputMode="numeric" value={horas} onChange={(e) => setHoras(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-[#1E3A5F]">
          <input type="checkbox" checked={precioConsultar} onChange={(e) => setPrecioConsultar(e.target.checked)} />
          Precio a consultar
        </label>
        {!precioConsultar && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Precio (USD)</label>
            <input className={inputClass} inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Descripción</label>
        <textarea className={`${inputClass} min-h-[120px]`} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Imágenes actuales</label>
        <ul className="space-y-2 text-sm">
          {imagenesUrls.map((u) => (
            <li key={u} className="flex items-center gap-2 break-all">
              <span className="text-[#5A6C7D] flex-1">{u.slice(0, 80)}{u.length > 80 ? '…' : ''}</span>
              <button type="button" className="text-red-700 underline shrink-0" onClick={() => removeUrl(u)}>
                Quitar
              </button>
            </li>
          ))}
          {imagenesUrls.length === 0 && <li className="text-[#8A9BA8]">Ninguna</li>}
        </ul>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">Agregar fotos (archivos)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="block w-full text-sm text-[#5A6C7D]"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6C7D]">URLs de imagen (opcional)</label>
        <textarea
          className={`${inputClass} min-h-[72px]`}
          placeholder="Una URL por línea (https://…)"
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#1E3A5F]">
        <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
        Publicar en el catálogo &quot;Comprar&quot;
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? 'Guardando…' : props.mode === 'create' ? 'Publicar' : 'Guardar cambios'}
        </button>
        <Link href="/cuenta/publicaciones" className={btnGhost}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
