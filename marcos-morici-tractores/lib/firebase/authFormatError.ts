import { FirebaseError } from 'firebase/app';

/** Mensajes en español para códigos comunes de Firebase Authentication. */
export function formatAuthError(err: unknown, fallback = 'Ocurrió un error. Probá de nuevo.'): string {
  if (err instanceof FirebaseError) {
    const map: Record<string, string> = {
      'auth/invalid-email': 'El correo no es válido.',
      'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
      'auth/user-not-found': 'No hay cuenta con ese correo.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
      'auth/email-already-in-use': 'Ese correo ya está registrado.',
      'auth/weak-password': 'La contraseña es demasiado débil.',
      'auth/network-request-failed': 'Error de red. Comprobá tu conexión e intentá de nuevo.',
      'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permití ventanas para este sitio.',
      'auth/popup-closed-by-user': 'Cerraste la ventana de Google. Intentá de nuevo.',
      'auth/cancelled-popup-request': 'Solo se puede abrir un inicio de sesión a la vez.',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo usando otro método de acceso.',
      'auth/operation-not-allowed': 'Este método está deshabilitado. Activá Email/contraseña o Google en Firebase Console → Authentication.',
      'auth/configuration-not-found':
        'Falta configuración de Auth (revisá dominios autorizados en Firebase Console → Authentication → Settings → Authorized domains).',
    };
    return map[err.code] ?? `${err.message} (${err.code})`;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
