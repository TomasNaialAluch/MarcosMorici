'use client';

import Breadcrumb from '@/components/Breadcrumb';
import CatalogoBusquedaField from '@/components/comprar/CatalogoBusquedaField';
import CatalogoEquiposList from '@/components/comprar/CatalogoEquiposList';
import CatalogoFiltrosChips from '@/components/comprar/CatalogoFiltrosChips';
import CatalogoFiltrosDrawer from '@/components/comprar/CatalogoFiltrosDrawer';
import CatalogoFiltrosForm from '@/components/comprar/CatalogoFiltrosForm';
import CatalogoToolbar from '@/components/comprar/CatalogoToolbar';
import CategoriaBar from '@/components/comprar/CategoriaBar';
import { useCatalogoEquipos } from '@/components/comprar/useCatalogoEquipos';

interface CatalogoClientProps {
  initialSearch?: string;
}

export default function CatalogoClient({ initialSearch = '' }: CatalogoClientProps) {
  const c = useCatalogoEquipos({ initialSearch });

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Comprar' }]} />

      <div className="bg-[#E8F4F8] border-b border-[#E0E5E9]">
        <div className="container mx-auto px-4 py-6">
          <p className="text-[#5A6C7D] text-center md:text-left max-w-3xl">
            Equipos seleccionados, listos para tu proyecto. Consultanos por WhatsApp para asesoramiento personalizado.
          </p>
        </div>
      </div>

      <CategoriaBar categorias={c.categorias} activa={c.categoria} onSelect={c.setCategoria} />

      <div className="container mx-auto px-4 py-6">
        <CatalogoFiltrosChips chips={c.chips} onLimpiarTodo={c.limpiarFiltros} />

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-full max-w-[280px] shrink-0">
            <div className="sticky top-4 rounded-lg border border-[#E0E5E9] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#1E3A5F] uppercase mb-4">Filtrar por</h2>
              <CatalogoFiltrosForm f={c.filtros} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <CatalogoToolbar
              onOpenFilters={() => c.setFiltersOpen(true)}
              loading={c.listado.loading}
              ordenadosLength={c.listado.ordenadosLength}
              start={c.listado.start}
              end={c.listado.end}
              sort={c.sort}
              onSortChange={c.setSort}
            />

            <CatalogoBusquedaField value={c.search} onChange={c.setSearch} />

            <CatalogoEquiposList
              loading={c.listado.loading}
              error={c.listado.error}
              onRetry={c.listado.load}
              rawLength={c.listado.rawLength}
              ordenadosLength={c.listado.ordenadosLength}
              slice={c.listado.slice}
              pageSafe={c.listado.pageSafe}
              totalPages={c.listado.totalPages}
              pageSize={c.listado.pageSize}
              onPageChange={c.listado.setPage}
              onPageSizeChange={c.listado.setPageSize}
            />
          </div>
        </div>
      </div>

      <CatalogoFiltrosDrawer open={c.filtersOpen} onClose={c.closeFiltersDrawer}>
        <CatalogoFiltrosForm f={c.filtros} />
      </CatalogoFiltrosDrawer>
    </div>
  );
}
