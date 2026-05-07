import { signInAnonymously } from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/config';

/**
 * Garantiza un `uid` para subir archivos y crear documentos sin pedir mail/contraseña.
 * Requiere tener habilitado «Anónimo» en Firebase Console → Authentication → Sign-in method.
 */
export async function ensureAnonymousUid(): Promise<{ uid: string } | { error: string }> {
  const auth = getClientAuth();
  if (!auth) {
    return { error: 'Firebase Auth no está disponible en este entorno.' };
  }
  if (auth.currentUser?.uid) {
    return { uid: auth.currentUser.uid };
  }
  try {
    const cred = await signInAnonymously(auth);
    return { uid: cred.user.uid };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'No se pudo iniciar sesión anónima.';
    return {
      error: `${msg} Si persiste, revisá en Firebase Console que el proveedor «Anónimo» esté habilitado.`,
    };
  }
}
