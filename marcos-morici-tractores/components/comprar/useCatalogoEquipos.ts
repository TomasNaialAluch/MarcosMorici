'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchEquiposPublicados } from '@/lib/firebase/equipos';
import type { Equipo, SortOption } from '@/lib/types/equipo';
import {
  statsFromEquipos,
  filtrarEquipos,
  ordenarEquipos,
  categoriasBarraCatalogo,
  conteosPorMarcaFiltrados,
  formatUsd,
  catalogoMostrarCapacidadBalde,
  catalogoMostrarFiltroHoras,
  catalogoMostrarFiltroPeso,
  type AppliedPriceRange,
  type AppliedYearRange,
  type AppliedRange,
} from '@/lib/catalog/catalogUtils';
import {
  DEFAULT_CATALOGO_PAGE_SIZE,
  type CatalogoPageSize,
} from '@/lib/catalog/constants';

export const CATALOGO_MARCA_PREVIEW = 8;

export interface CatalogoChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface UseCatalogoEquiposArgs {
  initialSearch?: string;
}

function inactiveRange(min: number, max: number): AppliedRange {
  return { min, max, active: false };
}

export function useCatalogoEquipos({ initialSearch = '' }: UseCatalogoEquiposArgs) {
  const [raw, setRaw] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoria, setCategoria] = useState<string | null>(null);
  const [marcasSel, setMarcasSel] = useState<Set<string>>(new Set());
  const [marcaBusqueda, setMarcaBusqueda] = useState('');
  const [marcasExpanded, setMarcasExpanded] = useState(false);

  const [precioOpen, setPrecioOpen] = useState(true);
  const [marcaOpen, setMarcaOpen] = useState(true);
  const [baldeOpen, setBaldeOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [horasOpen, setHorasOpen] = useState(false);
  const [pesoOpen, setPesoOpen] = useState(false);

  const [precioDraftMin, setPrecioDraftMin] = useState(0);
  const [precioDraftMax, setPrecioDraftMax] = useState(0);
  const [precioApplied, setPrecioApplied] = useState<AppliedPriceRange>({
    min: 0,
    max: 0,
    active: false,
  });

  const [yearDraftMin, setYearDraftMin] = useState(0);
  const [yearDraftMax, setYearDraftMax] = useState(0);
  const [yearApplied, setYearApplied] = useState<AppliedYearRange>({
    min: 0,
    max: 0,
    active: false,
  });

  const [horasDraftMin, setHorasDraftMin] = useState(0);
  const [horasDraftMax, setHorasDraftMax] = useState(0);
  const [horasApplied, setHorasApplied] = useState<AppliedRange>({ min: 0, max: 0, active: false });

  const [baldeDraftMin, setBaldeDraftMin] = useState(0);
  const [baldeDraftMax, setBaldeDraftMax] = useState(0);
  const [baldeApplied, setBaldeApplied] = useState<AppliedRange>({ min: 0, max: 0, active: false });

  const [pesoDraftMin, setPesoDraftMin] = useState(0);
  const [pesoDraftMax, setPesoDraftMax] = useState(0);
  const [pesoApplied, setPesoApplied] = useState<AppliedRange>({ min: 0, max: 0, active: false });

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<SortOption>('destacados');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CatalogoPageSize>(DEFAULT_CATALOGO_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchEquiposPublicados();
      setRaw(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los equipos.');
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSearch(initialSearch);
    setPage(1);
  }, [initialSearch]);

  useEffect(() => {
    if (raw.length === 0) return;
    const s = statsFromEquipos(raw);
    setPrecioDraftMin(s.precioMin);
    setPrecioDraftMax(s.precioMax);
    setYearDraftMin(s.anoMin);
    setYearDraftMax(s.anoMax);
    setHorasDraftMin(s.horasMin);
    setHorasDraftMax(s.horasMax);
    setBaldeDraftMin(s.baldeMin);
    setBaldeDraftMax(s.baldeMax);
    setPesoDraftMin(s.pesoMin);
    setPesoDraftMax(s.pesoMax);
    setPrecioApplied((prev) =>
      prev.active ? prev : { min: s.precioMin, max: s.precioMax, active: false }
    );
    setYearApplied((prev) =>
      prev.active ? prev : { min: s.anoMin, max: s.anoMax, active: false }
    );
    setHorasApplied((prev) =>
      prev.active ? prev : inactiveRange(s.horasMin, s.horasMax)
    );
    setBaldeApplied((prev) =>
      prev.active ? prev : inactiveRange(s.baldeMin, s.baldeMax)
    );
    setPesoApplied((prev) =>
      prev.active ? prev : inactiveRange(s.pesoMin, s.pesoMax)
    );
  }, [raw]);

  const categorias = useMemo(() => categoriasBarraCatalogo(raw), [raw]);

  const mostrarBalde = useMemo(
    () => catalogoMostrarCapacidadBalde(categoria, raw),
    [categoria, raw]
  );
  const mostrarHoras = useMemo(() => catalogoMostrarFiltroHoras(raw), [raw]);
  const mostrarPeso = useMemo(() => catalogoMostrarFiltroPeso(raw), [raw]);

  const filterBase = useMemo(
    () => ({
      categoria,
      marcas: marcasSel,
      search,
      price: precioApplied,
      year: yearApplied,
      horas: horasApplied,
      baldeM3: baldeApplied,
      pesoKg: pesoApplied,
    }),
    [categoria, marcasSel, search, precioApplied, yearApplied, horasApplied, baldeApplied, pesoApplied]
  );

  const filtrados = useMemo(() => filtrarEquipos(raw, filterBase), [raw, filterBase]);
  const ordenados = useMemo(() => ordenarEquipos(filtrados, sort), [filtrados, sort]);

  const marcaCounts = useMemo(() => {
    const optsSinMarca = {
      categoria,
      marcas: new Set<string>(),
      search,
      price: precioApplied,
      year: yearApplied,
      horas: horasApplied,
      baldeM3: baldeApplied,
      pesoKg: pesoApplied,
    };
    return conteosPorMarcaFiltrados(raw, optsSinMarca);
  }, [raw, categoria, search, precioApplied, yearApplied, horasApplied, baldeApplied, pesoApplied]);

  const marcasLista = useMemo(() => {
    const arr = [...marcaCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const q = marcaBusqueda.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(([m]) => m.toLowerCase().includes(q));
  }, [marcaCounts, marcaBusqueda]);

  const marcasVisibles = marcasExpanded
    ? marcasLista
    : marcasLista.slice(0, CATALOGO_MARCA_PREVIEW);

  const totalPages = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = ordenados.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const previewPrecio = useMemo(() => {
    if (raw.length === 0) return 0;
    const min = Math.min(precioDraftMin, precioDraftMax);
    const max = Math.max(precioDraftMin, precioDraftMax);
    return filtrarEquipos(raw, { ...filterBase, price: { min, max, active: true } }).length;
  }, [raw, filterBase, precioDraftMin, precioDraftMax]);

  const previewAno = useMemo(() => {
    if (raw.length === 0) return 0;
    const min = Math.min(yearDraftMin, yearDraftMax);
    const max = Math.max(yearDraftMin, yearDraftMax);
    return filtrarEquipos(raw, { ...filterBase, year: { min, max, active: true } }).length;
  }, [raw, filterBase, yearDraftMin, yearDraftMax]);

  const previewHoras = useMemo(() => {
    if (raw.length === 0) return 0;
    const min = Math.min(horasDraftMin, horasDraftMax);
    const max = Math.max(horasDraftMin, horasDraftMax);
    return filtrarEquipos(raw, { ...filterBase, horas: { min, max, active: true } }).length;
  }, [raw, filterBase, horasDraftMin, horasDraftMax]);

  const previewBalde = useMemo(() => {
    if (raw.length === 0) return 0;
    const min = Math.min(baldeDraftMin, baldeDraftMax);
    const max = Math.max(baldeDraftMin, baldeDraftMax);
    return filtrarEquipos(raw, { ...filterBase, baldeM3: { min, max, active: true } }).length;
  }, [raw, filterBase, baldeDraftMin, baldeDraftMax]);

  const previewPeso = useMemo(() => {
    if (raw.length === 0) return 0;
    const min = Math.min(pesoDraftMin, pesoDraftMax);
    const max = Math.max(pesoDraftMin, pesoDraftMax);
    return filtrarEquipos(raw, { ...filterBase, pesoKg: { min, max, active: true } }).length;
  }, [raw, filterBase, pesoDraftMin, pesoDraftMax]);

  useEffect(() => {
    setPage(1);
  }, [
    categoria,
    marcasSel,
    search,
    precioApplied,
    yearApplied,
    horasApplied,
    baldeApplied,
    pesoApplied,
    sort,
    pageSize,
  ]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const closeFiltersDrawer = useCallback(() => setFiltersOpen(false), []);

  const aplicarPrecio = useCallback(() => {
    const { precioMin, precioMax } = statsFromEquipos(raw);
    const min = Math.min(precioDraftMin, precioDraftMax);
    const max = Math.max(precioDraftMin, precioDraftMax);
    const active = min > precioMin || max < precioMax;
    setPrecioApplied({ min, max, active });
    setFiltersOpen(false);
  }, [raw, precioDraftMin, precioDraftMax]);

  const aplicarAno = useCallback(() => {
    const { anoMin, anoMax } = statsFromEquipos(raw);
    const min = Math.min(yearDraftMin, yearDraftMax);
    const max = Math.max(yearDraftMin, yearDraftMax);
    const active = min > anoMin || max < anoMax;
    setYearApplied({ min, max, active });
    setFiltersOpen(false);
  }, [raw, yearDraftMin, yearDraftMax]);

  const aplicarHoras = useCallback(() => {
    const { horasMin, horasMax } = statsFromEquipos(raw);
    const min = Math.min(horasDraftMin, horasDraftMax);
    const max = Math.max(horasDraftMin, horasDraftMax);
    const active = horasMax > horasMin && (min > horasMin || max < horasMax);
    setHorasApplied({ min, max, active });
    setFiltersOpen(false);
  }, [raw, horasDraftMin, horasDraftMax]);

  const aplicarBalde = useCallback(() => {
    const { baldeMin, baldeMax } = statsFromEquipos(raw);
    const min = Math.min(baldeDraftMin, baldeDraftMax);
    const max = Math.max(baldeDraftMin, baldeDraftMax);
    const active = baldeMax > baldeMin && (min > baldeMin || max < baldeMax);
    setBaldeApplied({ min, max, active });
    setFiltersOpen(false);
  }, [raw, baldeDraftMin, baldeDraftMax]);

  const aplicarPeso = useCallback(() => {
    const { pesoMin, pesoMax } = statsFromEquipos(raw);
    const min = Math.min(pesoDraftMin, pesoDraftMax);
    const max = Math.max(pesoDraftMin, pesoDraftMax);
    const active = pesoMax > pesoMin && (min > pesoMin || max < pesoMax);
    setPesoApplied({ min, max, active });
    setFiltersOpen(false);
  }, [raw, pesoDraftMin, pesoDraftMax]);

  const limpiarFiltros = useCallback(() => {
    setCategoria(null);
    setMarcasSel(new Set());
    setSearch('');
    setMarcaBusqueda('');
    const s = statsFromEquipos(raw);
    setPrecioDraftMin(s.precioMin);
    setPrecioDraftMax(s.precioMax);
    setPrecioApplied({ min: s.precioMin, max: s.precioMax, active: false });
    setYearDraftMin(s.anoMin);
    setYearDraftMax(s.anoMax);
    setYearApplied({ min: s.anoMin, max: s.anoMax, active: false });
    setHorasDraftMin(s.horasMin);
    setHorasDraftMax(s.horasMax);
    setHorasApplied(inactiveRange(s.horasMin, s.horasMax));
    setBaldeDraftMin(s.baldeMin);
    setBaldeDraftMax(s.baldeMax);
    setBaldeApplied(inactiveRange(s.baldeMin, s.baldeMax));
    setPesoDraftMin(s.pesoMin);
    setPesoDraftMax(s.pesoMax);
    setPesoApplied(inactiveRange(s.pesoMin, s.pesoMax));
    setPage(1);
    setFiltersOpen(false);
  }, [raw]);

  const toggleMarca = useCallback((m: string) => {
    setMarcasSel((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }, []);

  const chips = useMemo((): CatalogoChip[] => {
    const list: CatalogoChip[] = [];
    if (categoria)
      list.push({
        key: 'cat',
        label: categoria,
        onRemove: () => setCategoria(null),
      });
    marcasSel.forEach((m) =>
      list.push({
        key: `m-${m}`,
        label: m,
        onRemove: () => {
          setMarcasSel((prev) => {
            const n = new Set(prev);
            n.delete(m);
            return n;
          });
        },
      })
    );
    if (precioApplied.active)
      list.push({
        key: 'p',
        label: `${formatUsd(precioApplied.min)} – ${formatUsd(precioApplied.max)}`,
        onRemove: () => {
          const s = statsFromEquipos(raw);
          setPrecioApplied({ min: s.precioMin, max: s.precioMax, active: false });
          setPrecioDraftMin(s.precioMin);
          setPrecioDraftMax(s.precioMax);
        },
      });
    if (yearApplied.active)
      list.push({
        key: 'y',
        label: `Año ${yearApplied.min}–${yearApplied.max}`,
        onRemove: () => {
          const s = statsFromEquipos(raw);
          setYearApplied({ min: s.anoMin, max: s.anoMax, active: false });
          setYearDraftMin(s.anoMin);
          setYearDraftMax(s.anoMax);
        },
      });
    if (horasApplied.active)
      list.push({
        key: 'h',
        label: `Horas ${horasApplied.min.toLocaleString('es-AR')}–${horasApplied.max.toLocaleString('es-AR')}`,
        onRemove: () => {
          const s = statsFromEquipos(raw);
          setHorasApplied(inactiveRange(s.horasMin, s.horasMax));
          setHorasDraftMin(s.horasMin);
          setHorasDraftMax(s.horasMax);
        },
      });
    if (baldeApplied.active)
      list.push({
        key: 'b',
        label: `Balde ${baldeApplied.min}–${baldeApplied.max} m³`,
        onRemove: () => {
          const s = statsFromEquipos(raw);
          setBaldeApplied(inactiveRange(s.baldeMin, s.baldeMax));
          setBaldeDraftMin(s.baldeMin);
          setBaldeDraftMax(s.baldeMax);
        },
      });
    if (pesoApplied.active)
      list.push({
        key: 'w',
        label: `Peso ${pesoApplied.min.toLocaleString('es-AR')}–${pesoApplied.max.toLocaleString('es-AR')} kg`,
        onRemove: () => {
          const s = statsFromEquipos(raw);
          setPesoApplied(inactiveRange(s.pesoMin, s.pesoMax));
          setPesoDraftMin(s.pesoMin);
          setPesoDraftMax(s.pesoMax);
        },
      });
    if (search.trim())
      list.push({
        key: 'q',
        label: `“${search.trim()}”`,
        onRemove: () => setSearch(''),
      });
    return list;
  }, [
    categoria,
    marcasSel,
    precioApplied,
    yearApplied,
    horasApplied,
    baldeApplied,
    pesoApplied,
    search,
    raw,
  ]);

  const start = ordenados.length === 0 ? 0 : (pageSafe - 1) * pageSize + 1;
  const end = Math.min(pageSafe * pageSize, ordenados.length);

  const stats = useMemo(() => (raw.length ? statsFromEquipos(raw) : null), [raw]);

  return {
    raw,
    loading,
    error,
    load,
    categorias,
    categoria,
    setCategoria,
    chips,
    limpiarFiltros,
    filtros: {
      stats,
      mostrarBalde,
      mostrarHoras,
      mostrarPeso,
      precioOpen,
      setPrecioOpen,
      marcaOpen,
      setMarcaOpen,
      baldeOpen,
      setBaldeOpen,
      yearOpen,
      setYearOpen,
      horasOpen,
      setHorasOpen,
      pesoOpen,
      setPesoOpen,
      precioDraftMin,
      setPrecioDraftMin,
      precioDraftMax,
      setPrecioDraftMax,
      aplicarPrecio,
      previewPrecio,
      marcaBusqueda,
      setMarcaBusqueda,
      marcasVisibles,
      marcasListaLength: marcasLista.length,
      marcasSel,
      toggleMarca,
      marcasExpanded,
      setMarcasExpanded,
      yearDraftMin,
      setYearDraftMin,
      yearDraftMax,
      setYearDraftMax,
      aplicarAno,
      previewAno,
      horasDraftMin,
      setHorasDraftMin,
      horasDraftMax,
      setHorasDraftMax,
      aplicarHoras,
      previewHoras,
      baldeDraftMin,
      setBaldeDraftMin,
      baldeDraftMax,
      setBaldeDraftMax,
      aplicarBalde,
      previewBalde,
      pesoDraftMin,
      setPesoDraftMin,
      pesoDraftMax,
      setPesoDraftMax,
      aplicarPeso,
      previewPeso,
      limpiarFiltros,
    },
    listado: {
      loading,
      error,
      load,
      rawLength: raw.length,
      ordenadosLength: ordenados.length,
      slice,
      pageSafe,
      totalPages,
      setPage,
      pageSize,
      setPageSize,
      start,
      end,
    },
    sort,
    setSort,
    search,
    setSearch,
    filtersOpen,
    setFiltersOpen,
    closeFiltersDrawer,
  };
}

export type CatalogoEquiposController = ReturnType<typeof useCatalogoEquipos>;
