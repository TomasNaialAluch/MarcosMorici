import type { Equipo, SortOption } from '@/lib/types/equipo';

export interface AppliedPriceRange {
  min: number;
  max: number;
  active: boolean;
}

export interface AppliedYearRange {
  min: number;
  max: number;
  active: boolean;
}

export type AppliedRange = AppliedYearRange;

export function formatUsd(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function statsFromEquipos(equipos: Equipo[]) {
  const precios = equipos
    .map((e) => (e.precioConsultar ? null : e.precio))
    .filter((n): n is number => typeof n === 'number' && !Number.isNaN(n));
  const anos = equipos.map((e) => e.ano).filter((n): n is number => typeof n === 'number');
  const horasArr = equipos.map((e) => e.horas).filter((n): n is number => typeof n === 'number');
  const baldeArr = equipos
    .map((e) => e.capacidadBaldeM3)
    .filter((n): n is number => typeof n === 'number' && !Number.isNaN(n));
  const pesoArr = equipos
    .map((e) => e.pesoTotalKg)
    .filter((n): n is number => typeof n === 'number' && !Number.isNaN(n));

  const precioMin = precios.length ? Math.min(...precios) : 0;
  const precioMax = precios.length ? Math.max(...precios) : 0;
  const anoMin = anos.length ? Math.min(...anos) : new Date().getFullYear() - 30;
  const anoMax = anos.length ? Math.max(...anos) : new Date().getFullYear();
  const horasMin = horasArr.length ? Math.min(...horasArr) : 0;
  const horasMax = horasArr.length ? Math.max(...horasArr) : 0;
  const baldeMin = baldeArr.length ? Math.min(...baldeArr) : 0;
  const baldeMax = baldeArr.length ? Math.max(...baldeArr) : 0;
  const pesoMin = pesoArr.length ? Math.min(...pesoArr) : 0;
  const pesoMax = pesoArr.length ? Math.max(...pesoArr) : 0;

  const marcas = new Map<string, number>();
  for (const e of equipos) {
    const m = e.marca.trim() || 'Sin marca';
    marcas.set(m, (marcas.get(m) ?? 0) + 1);
  }

  return {
    precioMin,
    precioMax,
    anoMin,
    anoMax,
    horasMin,
    horasMax,
    baldeMin,
    baldeMax,
    pesoMin,
    pesoMax,
    marcas,
  };
}

export function textoCoincideBusqueda(e: Equipo, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const blob = [e.titulo, e.marca, e.modelo, e.descripcion ?? '', e.categoria ?? '']
    .join(' ')
    .toLowerCase();
  return blob.includes(s);
}

export type CatalogoFiltrosOpts = {
  categoria: string | null;
  marcas: Set<string>;
  search: string;
  price: AppliedPriceRange;
  year: AppliedYearRange;
  horas: AppliedRange;
  baldeM3: AppliedRange;
  pesoKg: AppliedRange;
};

export function filtrarEquipos(equipos: Equipo[], opts: CatalogoFiltrosOpts): Equipo[] {
  return equipos.filter((e) => {
    if (opts.categoria && (e.categoria ?? '').trim() !== opts.categoria) return false;
    if (opts.marcas.size > 0 && !opts.marcas.has(e.marca.trim() || 'Sin marca')) return false;
    if (!textoCoincideBusqueda(e, opts.search)) return false;

    if (opts.price.active) {
      if (e.precioConsultar || e.precio == null) return false;
      if (e.precio < opts.price.min || e.precio > opts.price.max) return false;
    }

    if (opts.year.active) {
      if (e.ano == null) return false;
      if (e.ano < opts.year.min || e.ano > opts.year.max) return false;
    }

    if (opts.horas.active) {
      if (e.horas == null) return false;
      if (e.horas < opts.horas.min || e.horas > opts.horas.max) return false;
    }

    if (opts.baldeM3.active) {
      if (e.capacidadBaldeM3 == null) return false;
      if (e.capacidadBaldeM3 < opts.baldeM3.min || e.capacidadBaldeM3 > opts.baldeM3.max) return false;
    }

    if (opts.pesoKg.active) {
      if (e.pesoTotalKg == null) return false;
      if (e.pesoTotalKg < opts.pesoKg.min || e.pesoTotalKg > opts.pesoKg.max) return false;
    }

    return true;
  });
}

export function ordenarEquipos(equipos: Equipo[], sort: SortOption): Equipo[] {
  const copy = [...equipos];
  const precio = (e: Equipo) => (e.precioConsultar || e.precio == null ? Infinity : e.precio);
  const ano = (e: Equipo) => e.ano ?? 0;
  const horas = (e: Equipo) => e.horas ?? Infinity;
  const time = (e: Equipo) => (e.createdAt ? e.createdAt.getTime() : 0);

  switch (sort) {
    case 'destacados':
      return copy.sort((a, b) => {
        const d = Number(b.destacado) - Number(a.destacado);
        if (d !== 0) return d;
        return time(b) - time(a);
      });
    case 'precioAsc':
      return copy.sort((a, b) => precio(a) - precio(b));
    case 'precioDesc':
      return copy.sort((a, b) => precio(b) - precio(a));
    case 'anoDesc':
      return copy.sort((a, b) => ano(b) - ano(a));
    case 'anoAsc':
      return copy.sort((a, b) => ano(a) - ano(b));
    case 'horasAsc':
      return copy.sort((a, b) => horas(a) - horas(b));
    case 'recientes':
    default:
      return copy.sort((a, b) => time(b) - time(a));
  }
}

/** Orden de categorías conocidas; el resto alfabético al final. */
export const CATALOGO_CATEGORIAS_ORDEN = [
  'Excavadoras',
  'Retropalas',
  'Cargadoras',
  'Minicargadoras',
  'Compactación',
  'Motoniveladoras',
  'Topadoras',
  'Otros',
] as const;

export function categoriasOrdenadas(equipos: Equipo[]): string[] {
  const set = new Set<string>();
  for (const e of equipos) {
    const c = (e.categoria ?? '').trim();
    if (c) set.add(c);
  }
  const list = [...set];
  list.sort((a, b) => {
    const ia = (CATALOGO_CATEGORIAS_ORDEN as readonly string[]).indexOf(a);
    const ib = (CATALOGO_CATEGORIAS_ORDEN as readonly string[]).indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return list;
}

/** Categorías con datos; si no hay ninguna en Firestore (o catálogo vacío), igual mostramos la fila ilustrada completa (UX tipo Vialmaq). */
export function categoriasBarraCatalogo(equipos: Equipo[]): string[] {
  const fromData = categoriasOrdenadas(equipos);
  if (fromData.length > 0) return fromData;
  return [...CATALOGO_CATEGORIAS_ORDEN];
}

export function conteosPorMarcaFiltrados(
  equipos: Equipo[],
  opts: Omit<CatalogoFiltrosOpts, 'marcas'>
): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of equipos) {
    if (!filtrarEquipos([e], { ...opts, marcas: new Set() }).length) continue;
    const m = e.marca.trim() || 'Sin marca';
    map.set(m, (map.get(m) ?? 0) + 1);
  }
  return map;
}

/** §5.3 README: balde si hay dato y la categoría encaja con líneas que suelen usar m³. */
export function catalogoMostrarCapacidadBalde(categoria: string | null, equipos: Equipo[]): boolean {
  const hay = equipos.some(
    (e) => typeof e.capacidadBaldeM3 === 'number' && !Number.isNaN(e.capacidadBaldeM3 as number)
  );
  if (!hay) return false;
  if (!categoria) return true;
  const n = categoria.toLowerCase();
  return (
    n.includes('excavad') ||
    n.includes('cargador') ||
    n.includes('minicarg') ||
    n.includes('retrop')
  );
}

export function catalogoMostrarFiltroHoras(equipos: Equipo[]): boolean {
  return equipos.some((e) => typeof e.horas === 'number');
}

export function catalogoMostrarFiltroPeso(equipos: Equipo[]): boolean {
  return equipos.some((e) => typeof e.pesoTotalKg === 'number');
}
