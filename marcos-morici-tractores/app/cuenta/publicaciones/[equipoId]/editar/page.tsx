import Link from 'next/link';
import MisEquipoEditarLoader from '@/components/account/publicaciones/MisEquipoEditarLoader';
import { CUENTA_EQUIPO_EDIT_PLACEHOLDER } from '@/lib/cuenta/staticExportPlaceholders';

type Props = { params: Promise<{ equipoId: string }> };

export function generateStaticParams(): { equipoId: string }[] {
  return [{ equipoId: CUENTA_EQUIPO_EDIT_PLACEHOLDER }];
}

export default async function EditarPublicacionPage({ params }: Props) {
  const { equipoId } = await params;
  return (
    <div className="max-w-3xl">
      <Link
        href="/cuenta/publicaciones"
        className="text-sm font-semibold text-[#1E3A5F] hover:text-[#D9773F] underline"
      >
        ← Mis publicaciones
      </Link>
      <div className="mt-4">
        <MisEquipoEditarLoader equipoId={decodeURIComponent(equipoId)} />
      </div>
    </div>
  );
}
