# Base de datos y identidad — catálogo tipo Vialmaq, filtros y usuarios

Este documento describe **qué hay que guardar en Firebase** (y cómo encajarlo con la referencia comercial tipo [Vialmaq](https://vialmaq.com.ar/)) para que funcionen **categorías, filtros, imágenes y detalle** del sitio Marcos Morici Tractores. También resume **cómo armar registro e inicio de sesión** (teléfono, correo, Google, Facebook) y una **opinión de producto** sobre mostrar al vendedor y permitir conversación.

Complementa [`README_COMPRAR_VIALMAQ.md`](./README_COMPRAR_VIALMAQ.md) (§6 facetas + UI), [`README_ENV.md`](./README_ENV.md) (variables) y el código en `lib/types/equipo.ts`, `lib/firebase/equipos.ts`, `lib/catalog/catalogUtils.ts`.

---

## 1. Visión general

| Pieza | Tecnología sugerida | Rol |
|-------|---------------------|-----|
| Catálogo público | **Firestore** — colección `equipos` | Listado `/comprar`, filtros, detalle por `slug`. |
| Archivos (fotos) | **Firebase Storage** | URLs HTTPS en el campo `imagenes[]` (o migración desde `imagen` legacy). |
| Quién sube qué | **Firebase Auth** + perfil en Firestore (`users` / claims) | Dueños, empleados o terceros que publican máquinas. |
| Mensajes comprador ↔ vendedor (+ **admin** en el mismo hilo) | **Firestore** (`conversaciones` / subcolección `mensajes`) **o** **WhatsApp / mailto** en v1 | Modelo asistido: admins ven todos los hilos y escriben como **Administración** — ver **§5.1**. |

Hoy el front **carga los equipos publicados** desde Firestore y aplica filtros en cliente (`fetchEquiposPublicados`). Escala bien para inventarios de concesionario; si el catálogo crece mucho, se puede paginar o filtrar en servidor más adelante sin cambiar el modelo conceptual de campos.

---

## 2. Colección `equipos` — campos necesarios (y para qué sirven)

Los nombres deben coincidir con lo que espera `equipoFromDoc` en `lib/firebase/equipos.ts` (se aceptan **alias** donde ya está mapeado).

### 2.1 Identidad y publicación

| Campo Firestore | Obligatorio | Uso |
|-----------------|-------------|-----|
| `publicado` | Recomendado (`true` para catálogo) | Si es `false`, el listado público puede excluir el ítem (según reglas y query). |
| `slug` | Recomendado (único) | URL detalle: **`/comprar/[slug]`** (ficha dedicada; la query `?equipo=` redirige al mismo slug). Si falta, el código arma uno desde marca + modelo + id. |
| `createdAt` | Opcional (timestamp) | Orden «más recientes» y trazabilidad. |
| `destacado` | Opcional (boolean) | Orden «Destacados primero». |

### 2.2 Texto y búsqueda (barra «Buscar en catálogo»)

| Campo | Obligatorio | Uso |
|-------|-------------|-----|
| `titulo` | Implícito (se arma si falta) | Cabecera de card y detalle. |
| `marca` | Sí (o «Sin marca») | Filtro por checklist + conteos facetados. |
| `modelo` | Sí (o «Sin modelo») | Título y slug. |
| `descripcion` | Opcional | Búsqueda full-text simple (substring) + detalle. |
| `categoria` | Muy recomendado | **Barra superior de tipos** (`CategoriaBar`): el valor debe ser **el mismo string** para todos los equipos de ese tipo (ej. `Excavadoras`). Alias aceptado: `tipoEquipo`. |

**Tipos Vialmaq / referencia:** excavadoras, retropalas, cargadoras, minicargadoras, compactación, motoniveladoras, topadoras, otros — en Firestore usá **una etiqueta estable** (podés normalizar mayúsculas/minúsculas en el admin al guardar).

### 2.3 Precio y comercial

| Campo | Uso |
|-------|-----|
| `precio` **o** `precioUsd` | Número en USD para card, orden y **slider de precio**. |
| `precioConsultar` | Si es `true`, no entra en el rango de precio del filtro (equipo «sin precio listado»). |

### 2.4 Facetas de filtros (sidebar tipo §5 README comprar)

| Campo | Uso en filtros |
|-------|----------------|
| `ano` **o** `year` | Rango año de fabricación. |
| `horas` | Rango horas de uso (solo se muestra el bloque si **algún** equipo tiene número). |
| `capacidadBaldeM3` | Rango m³; el UI muestra el bloque si hay datos **y** la categoría encaja (excavadora, cargador, etc.) — ver `catalogoMostrarCapacidadBalde`. |
| `pesoTotalKg` | Rango kg; solo si hay datos en el stock. |

Si un campo numérico no aplica a una máquina, **omitilo** o dejalo vacío: el filtro correspondiente puede ocultarse cuando no hay variación útil en los datos.

### 2.5 Imágenes

| Campo | Uso |
|-------|-----|
| `imagenes` | **Array de strings** — URLs públicas (típico: descarga de **Firebase Storage** con token o reglas de lectura pública para carpeta `equipos/…`). Orden = orden de carrusel en card/detalle. |
| `imagen` (legacy) | Un solo string; el código convierte a `imagenes: [imagen]` si no hay array. Preferí migrar todo a `imagenes`. |

**PDF / folleto en ficha de detalle:** campo opcional `folletoPdfUrl` en el documento del equipo (alias aceptados en código: `pdfUrl`, `documentoPdf`, `folletoUrl`, `fichaPdfUrl`). Se muestra bloque de previsualización y enlace de descarga en `EquipoDetallePdf`.

**Consultas y ofertas desde la ficha:** colección Firestore **`equipoContactos`** (`lib/firebase/equipoContacto.ts`) — tipos `consulta`, `oferta`, `chat_sesion`. Configurá reglas de escritura (anónimo acotado o solo usuarios autenticados).

**Buenas prácticas:** varias resoluciones opcionales (thumbnail en Storage o `next/image` con URL estable); peso de archivo razonable; primera imagen = portada.

### 2.6 Campos futuros recomendados (vendedor y moderación)

No están todos en `Equipo` todavía; conviene documentarlos para cuando habilites «subir mi tractor»:

| Campo sugerido | Tipo | Uso |
|----------------|------|-----|
| `ownerId` | string (UID Auth) | Quién creó el anuncio. |
| `ownerDisplayName` | string (snapshot) | Nombre público en ficha sin join obligatorio. |
| `ownerRole` | `empresa` \| `cliente` | Para UI distinta o badge «Particular» vs «Marcos Morici». |
| `estadoRevision` | `borrador` \| `pendiente` \| `aprobado` \| `rechazado` | Moderación antes de `publicado: true` para uploads de terceros. |
| `ubicacion` o `provincia` | string | Filtro geográfico futuro; opcional. |

---

## 3. Índices y reglas Firestore

- **Query actual:** `where('publicado', '==', true)` sobre `equipos`. Si más adelante usás solo `getDocs` sin filtro en cliente, las **reglas de seguridad** deben impedir lectura de borradores a usuarios anónimos.
- **Detalle por slug:** query `where('slug', '==', slug)` + `limit(1)` — si usás mucho esto en producción, garantizá **unicidad de `slug`** al crear/editar (Cloud Function o validación en panel admin).
- **Storage:** reglas que permitan **lectura** de objetos bajo `equipos/{id}/...` a usuarios autenticados o públicos según política; **escritura** solo a roles autorizados o con flujo «subir → metadata en Firestore».

---

## 4. Registro e inicio de sesión (Firebase Authentication)

Objetivo: que **empleados de la empresa** gestionen todo el catálogo y, si lo desean, **clientes habituales** puedan registrarse y cargar una máquina para venta (con moderación recomendada).

### 4.1 Proveedores a habilitar en la consola Firebase

En **Authentication → Sign-in method**:

1. **Correo electrónico / contraseña** — base para «mail + contraseña»; podés añadir **verificación de correo** antes de publicar.
2. **Google** — activar y configurar consent screen en Google Cloud si hace falta.
3. **Facebook** — crear app en [Meta for Developers](https://developers.facebook.com/), ID de app y secreto en Firebase; dominios autorizados en producción.
4. **Teléfono** — reCAPTCHA invisible / verificación SMS; revisá cuotas y costos por SMS según región.

**Nota:** Apple Sign In es obligatorio si publicás en iOS con login social de terceros; para web solo Argentina suele bastar Google + mail.

### 4.2 Colección `users` — campo `role`: `user` | `admin`

Cada usuario autenticado tiene un documento **`users/{uid}`** donde `uid` es el **UID de Firebase Auth** (mismo id que `request.auth.uid` en reglas).

| Campo | Tipo | Obligatorio | Uso |
|-------|------|-------------|-----|
| `role` | `string` | Sí (implícito al crear) | **`user`** — cuenta estándar: solo sus datos y (futuro) sus conversaciones. **`admin`** — puede usar la misma web pero con permisos extendidos: **ver todas las conversaciones** y enviar mensajes como **Administración** (ver §5.1). |
| `email` | string \| null | Recomendado | Espejo de Auth para listados y soporte. |
| `displayName` | string \| null | Opcional | Nombre para mostrar. |
| `photoURL` | string \| null | Opcional | Avatar. |
| `createdAt` | timestamp | Auto al crear | Auditoría. |
| `updatedAt` | timestamp | Auto en cada login | Mantener perfil al día. |

**Alta de cuenta:** en el primer inicio de sesión la app crea el documento con **`role: 'user'`** si no existe (`ensureUserProfile` en `lib/firebase/userProfile.ts`). No se pisa `role` en logins posteriores, así que un **`admin`** asignado manualmente se conserva.

**Promover a administrador:** en **Firebase Console → Firestore** editá el documento `users/<uid>` y establecé **`role`** con el string exacto **`admin`**. Alternativa: script con **Admin SDK** (nunca desde el cliente).  
*Compatibilidad:* si existía un array legacy **`roles`** con la cadena `'admin'`, el código de lectura lo trata como administrador.

**Seguridad:** la UI oculta menús según `role`, pero la **fuente de verdad** para datos sensibles son las **reglas de Firestore** (y, en producción fuerte, **Custom Claims** en el token). Ver §4.5.

### 4.3 Rutas de la app (Next.js)

| Ruta | Quién | Descripción |
|------|--------|-------------|
| `/acceso` | Público | **Ingresar o registrarse:** pestañas Ingresar / Registrarse, correo + contraseña + Google. Query `?tab=ingresar` \| `?tab=registro`, opcional `?redirect=/ruta` tras login. |
| `/login` | — | Redirección a `/acceso?tab=ingresar` (compatibilidad). |
| `/registro` | — | Redirección a `/acceso?tab=registro` (compatibilidad). |
| `/cuenta` | Autenticado | Redirige a `/cuenta/perfil`. |
| `/cuenta/perfil` | Autenticado | Datos de sesión, rol, cerrar sesión. |
| `/cuenta/mensajes` | Autenticado | Inbox: hoy placeholder; con `role === 'admin'` el copy indica vista global (cuando exista la colección `conversaciones`). |

El **admin** usa las **mismas URLs** que un usuario; la diferencia es el valor de **`role`** en `users/{uid}` y las consultas/reglas sobre conversaciones.

### 4.4 Estructura de carpetas en el repo (`components/account`)

Resumen (detalle en [`components/account/README.md`](./components/account/README.md)):

- `providers/` — `AuthProvider`, `AccountProviders` (envuelve el `body` en `app/layout.tsx`).
- `auth/` — `AccesoClient` (pestañas ingresar / registrarse), `LoginForm`, `RegisterForm`, `SocialAuthButtons` (Google operativo; Facebook y teléfono deshabilitados en UI hasta configurarlos en la consola).
- `cuenta/` — `CuentaAuthGate`, `CuentaTabs`, `PerfilResumen`.
- `mensajes/` — `MensajesPanel` (placeholder hasta backend de hilos).
- `layout/` — `HeaderAccount` (enlaces Ingresar / Registro / Mi cuenta / Mensajes / Salir en el `Header`).

Tipos: `lib/types/user.ts`. Firestore helpers: `lib/firebase/userProfile.ts`. Auth de cliente: `getClientAuth()` en `lib/firebase/config.ts`.

### 4.5 Reglas Firestore sugeridas (colección `users`)

Hasta que definamos reglas en el repo, en la consola podés usar una base como:

```text
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && request.auth.uid == userId
    && request.resource.data.role == 'user';
  allow update: if request.auth != null && request.auth.uid == userId
    && request.resource.data.role == resource.data.role;
}
```

- El **usuario** solo lee/actualiza **su** documento; la condición `request.resource.data.role == resource.data.role` en `update` impide que el cliente cambie `role` desde la app.
- Para **crear** el primer doc, la regla de `create` puede exigir `role == 'user'`.
- Los **admins** que necesiten leer otros `users` requieren una condición extra con **custom claim** `admin` o un backend.

Ajustá estas reglas con vuestro abogado técnico / revisión de seguridad antes de producción.

### 4.6 Proveedores en Firebase Console (recordatorio)

En **Authentication → Sign-in method**: correo/contraseña, Google, (opcional) Facebook y teléfono — alineado con §4.1 histórico del documento.

### 4.7 Flujo «subir tractor»

1. Usuario autenticado completa formulario → sube imágenes a Storage → escribe documento en `equipos` con `ownerId` y `estadoRevision: 'pendiente'` (terceros) o directamente `publicado: true` (admins).
2. Panel interno o Cloud Function marca `aprobado` y entonces `publicado: true`.

---

## 5. Opinión de producto: ¿mostrar quién subió cada máquina? ¿Conversación en la página?

### Mostrar al vendedor / publicador

**Sí conviene**, con matices:

- **Confianza:** en marketplaces, ver **«Publicado por Marcos Morici»** vs **«Particular — Juan P.»** reduce fricción y aclara a quién le estás comprando.
- **Marca del negocio:** la mayoría de anuncios serán de la empresa; podés mostrar un **bloque uniforme** («Venta oficial Marcos Morici») y solo para `ownerRole === 'cliente'` mostrar nombre suave o iniciales.
- **Privacidad:** no hace falta el teléfono completo en la ficha; bastan **nombre comercial** + botón «Consultar».

### Conversación desde la página

Opciones razonables:

1. **MVP (rápido):** botón **WhatsApp** / **mailto** con mensaje prellenado que incluya el `slug` o título del equipo (ya alineado con `README_ENV.md`). Cero backend de chat.
2. **Siguiente nivel:** formulario «Enviar consulta» que guarda un documento en `consultas` o mensajes en una subcolección `equipos/{id}/mensajes` y notifica por mail/Slack al vendedor (Cloud Functions + extensiones o SendGrid).
3. **Chat en vivo:** coste y complejidad altos para un catálogo de maquinaria; suele ser excesivo salvo que el volumen de leads lo justifique.

**Recomendación:** mostrar **quién publica** (o marca de empresa) + **un canal claro de contacto** (WhatsApp a la concesión para stock propio; para particulares, consulta moderada o número verificado). Así cubrís al cliente habitual que «se quiere hacer usuario» sin convertir el sitio en red social.

### 5.1 Modelo de venta asistido: admins en el chat

Sí, se entiende el modelo: no es solo «comprador habla con vendedor del aviso», sino un **canal de venta donde la concesión puede participar** para concretar (asesoramiento, visita, financiación, permuta, cierre).

- **Visibilidad:** usuarios con rol **admin** (o `staff`) acceden a **todas las conversaciones** (inbox global o búsqueda por equipo / usuario). Los compradores y vendedores solo ven **sus** hilos.
- **Mensajes del admin:** cada mensaje guarda quién lo envió y **de qué tipo es el emisor**. En la UI, los mensajes escritos por un admin deben mostrarse **claramente como parte del equipo comercial** (ej. etiqueta fija **«Administración — Marcos Morici»** o **«Equipo comercial»**), no como si fueran el vendedor particular. Eso genera confianza, ordena responsabilidades y evita confusiones sobre precios u ofertas.
- **Datos sugeridos por mensaje** (colección `conversaciones/{id}/mensajes` o equivalente): `senderId`, `senderRole` (`comprador` | `vendedor` | `admin` | `sistema`), `texto`, `createdAt`, opcional `leidoPor`.
- **Reglas:** lectura del hilo solo para participantes + admins; escritura acorde al rol. Opcional: **log de auditoría** cuando un admin abre o interviene en conversaciones ajenas (política interna).

Este patrón es un **CRM liviano** encima del catálogo: útil cuando mezclás stock propio, empleados que publican y algún cliente que sube su máquina.

---

## 6. Resumen checklist de datos (para que «se vea como el catálogo»)

- [ ] Cada equipo **publicado** con `publicado: true` y `slug` único.
- [ ] `marca`, `modelo`, `categoria` (consistente con la barra de categorías).
- [ ] Precio (`precio` o `precioUsd`) o `precioConsultar: true`.
- [ ] `imagenes` (array de URLs) o `imagen` legacy.
- [ ] Opcionales según stock: `ano`, `horas`, `capacidadBaldeM3`, `pesoTotalKg`, `destacado`, `descripcion`.
- [ ] Reglas Firestore + Storage alineadas con auth y roles.
- [ ] (Futuro) `ownerId`, revisión y UI de vendedor + contacto.
- [x] Auth en app: login, registro, área `/cuenta` (perfil + mensajes placeholder), `role` `user` \| `admin` en `users/{uid}`.
- [ ] (Futuro) Chat: conversaciones por equipo, **roles en mensajes** y UI que distinga **Administración** del vendedor del aviso.

---

## 7. Referencias cruzadas en código

| Tema | Archivo |
|------|---------|
| Tipo `Equipo` | `lib/types/equipo.ts` |
| Lectura / mapeo Firestore | `lib/firebase/equipos.ts` |
| Filtros y stats | `lib/catalog/catalogUtils.ts` |
| Auth / cuenta | `components/account/**`, `app/acceso`, `app/login` (redirect), `app/registro` (redirect), `app/cuenta/**`, `lib/firebase/userProfile.ts`, `lib/types/user.ts` |
| Índice carpetas cuenta | [`components/account/README.md`](./components/account/README.md) |

---

*Documento orientado a implementación y producto; ajustar nombres de colecciones solo si migrás a otro esquema y actualizás el código en consecuencia.*
