import RequireAdmin from '@/components/account/cuenta/RequireAdmin';
import MisPublicacionesClient from '@/components/account/publicaciones/MisPublicacionesClient';

export default function CuentaPublicacionesPage() {
  return (
    <RequireAdmin>
      <MisPublicacionesClient />
    </RequireAdmin>
  );
}
