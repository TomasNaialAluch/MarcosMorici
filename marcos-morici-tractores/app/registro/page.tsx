import LegacyAuthRedirect from '@/components/LegacyAuthRedirect';

/** Compatibilidad: enlaces viejos a `/registro` van a la página unificada `/acceso`. */
export default function RegistroPage() {
  return <LegacyAuthRedirect tab="registro" />;
}
