import LegacyAuthRedirect from '@/components/LegacyAuthRedirect';

/** Compatibilidad: enlaces viejos a `/login` van a la página unificada `/acceso`. */
export default function LoginPage() {
  return <LegacyAuthRedirect tab="ingresar" />;
}
