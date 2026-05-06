# Cuenta y autenticación (`components/account`)

Estructura pensada para escalar (chat, publicaciones, preferencias).

| Carpeta | Contenido |
|---------|-----------|
| `providers/` | `AccountProviders`, `AuthProvider` — contexto de sesión Firebase + perfil Firestore. |
| `auth/` | Formularios de login, registro y botones sociales. |
| `cuenta/` | Layout de área privada: pestañas, gate de auth, resumen de perfil. |
| `mensajes/` | Panel de conversaciones (placeholder hasta colección `conversaciones`). |
| `layout/` | Piezas de shell global que dependen de auth, p. ej. `HeaderAccount`. |

Rutas Next.js: **`/acceso`** (ingresar o registrarse), `/cuenta/perfil`, `/cuenta/mensajes`. Las rutas `/login` y `/registro` redirigen a `/acceso` con la pestaña correspondiente.

Modelo de datos y roles: [`README_DATABASE.md`](../../README_DATABASE.md).
