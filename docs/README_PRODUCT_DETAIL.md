# Ficha de producto (Product detail) — especificación y gaps

Documento de referencia para alinear la **ficha pública** de un equipo (ruta tipo `/comprar/{slug}`) y el **flujo de carga** desde la cuenta, sin saltear requisitos. Estética y jerarquía tomadas de la referencia comercial [Vialmaq — ejemplo Caterpillar 313GC](https://vialmaq.com.ar/caterpillar-313gc).

---

## 1. Referencia visual (Vialmaq)

- **Layout desktop**: dos columnas sobre fondo blanco.
  - **Columna izquierda**: galería — imagen principal grande + **franja horizontal de miniaturas** debajo; la miniatura activa se destaca (ej. borde color contraste).
  - **Columna derecha** (orden vertical, de arriba hacia abajo):
    1. **Título** del equipo (nombre comercial / marca + modelo, tipografía grande y contundente).
    2. **Precio** (ej. `US$ 115.000,00` — formato moneda claro).
    3. **Botón principal “Consultar”** — barra ancha, estilo secundario neutro (gris), texto blanco en mayúsculas (CTA de contacto, no confundir con “Comprar”).
    4. **Descripción** — párrafo(s) de texto; puede incluir negritas para datos puntuales (motor, HP, equipamiento).
    5. **Bloque folleto PDF**:
       - Texto guía en cursiva / énfasis: *VER CARACTERÍSTICAS TÉCNICAS EN EL FOLLETO*.
       - Enlace **Descargar** con icono (flecha hacia abajo en círculo), color **teal / verde azulado** distinto del resto de links corporativos.
    6. **Tabla “Características”** — filas con **label en negrita** a la izquierda y **valor** a la derecha; separadores horizontales sutiles entre filas; alineación tipo dos columnas legibles (no obligatorio grid de specs duplicado fuera de esta tabla).

- **Elementos opcionales en referencia** (evaluar si los necesitamos): estado *En stock*, **SKU** visible, bloque de formulario de contacto embebido. El carrusel *“También te puede interesar”* está especificado en la **§3** (bloque deseado al pie de la ficha).

- **Móvil**: misma jerarquía; la galería suele ir **arriba** y el bloque de datos debajo (stack vertical).

---

## 2. Objetivo para Marcos Morici (orden de bloques)

Orden **canónico** en la ficha pública (paridad con referencia):

| # | Bloque | Notas |
|---|--------|--------|
| 1 | **Migas de pan** | `Inicio > Comprar > {título}` (ya existe en el proyecto). |
| 2 | **Grid 2 columnas** (≥ breakpoint lg): izquierda galería / derecha “columna de venta”. |
| 3 | **Columna derecha — título** | Un solo H1 visual por ficha; puede repetir marca/modelo si el título es comercial. |
| 4 | **Columna derecha — precio** | “Consultar valor” o importe en USD formateado (`es-AR`). |
| 5 | **Columna derecha — CTA Consultar** | Botón destacado ancho; acción: abrir WhatsApp / formulario / panel de contacto (definir un solo comportamiento). |
| 6 | **Columna derecha — descripción** | Texto largo; `whitespace-pre-wrap` o markdown futuro. |
| 7 | **Columna derecha — PDF** | Título humano + link Descargar (y opcional vista incrustada según política de peso y UX). |
| 8 | **Columna derecha — tabla Características técnicas** | Solo datos de ficha; etiquetas alineadas al estilo referencia (filas con línea divisoria). |
| 9 | **Pie de página — “También te puede interesar”** | Carrusel de equipos relacionados (prioridad **misma categoría**); §3. |

**Regla**: la **descripción** no debe quedar “colgada” debajo del grid completo si el objetivo es igualar Vialmaq: en la referencia todo el texto largo y el PDF y la tabla siguen **en la columna derecha** bajo precio/CTA. Si en móvil el ancho es angosto, todo ese stack sigue siendo un único flujo vertical.

**Debajo del grid** (full width, antes del footer): formulario de consulta, WhatsApp flotante, y la sección **“También te puede interesar”** (§3) — como segunda etapa de lectura.

---

## 3. También te puede interesar (productos relacionados)

Ubicación: **al pie de la ficha**, después del contenido principal (columnas + bloque de contacto / consulta), como cierre de página antes del footer.

### 3.1 Comportamiento esperado (referencia Vialmaq)

- **Título de sección**: *“**También te puede interesar**”* (copy fijo en español).
- **Patrón UI**: **carrusel / slider horizontal** de tarjetas (varios ítems visibles a la vez en desktop; desplazamiento con flechas).
- **Criterio de productos (inferido de la referencia)**: priorizar equipos de la **misma categoría** que el producto actual (`categoria` en Firestore, alineado al catálogo). **Excluir** siempre el equipo cuya ficha se está viendo (mismo `slug` o `id`).
- **Orden sugerido**: destacados primero (`destacado`), luego por fecha de publicación o relevancia — **definir regla de negocio** al implementar.
- **Fallback**: si hay pocas o ninguna publicación en esa categoría, mostrar otro conjunto (ej. destacados globales, otras categorías cercanas) u **ocultar la sección** si no hay datos útiles.

### 3.2 Contenido de cada tarjeta (paridad con referencia)

Reutilizar los mismos datos que las cards del catálogo (`Equipo`):

| Elemento | Fuente / notas |
|----------|----------------|
| **Imagen** | Primera URL de `imagenes[]`; proporción tipo card (mitad superior de la tarjeta). |
| **Título** | Marca + modelo o `titulo`; en referencia va en **mayúsculas** encima del metadata. |
| **Año** | Icono calendario + `ano`. |
| **Horas** | Icono reloj + `horas` + sufijo local (`490 hs.`). |
| **Badge** | “VENTA” (o el estado comercial que defina el negocio). |
| **Precio** | Formato USD `es-AR` o texto “Consultar valor” según `precio` / `precioConsultar`. |

**Enlace**: `/comprar/{slug}` — respetar navegación compatible con hosting estático del proyecto (evitar transiciones cliente rotas; ver implementación de cards existente).

### 3.3 Controles del carrusel

- Flechas **anterior / siguiente** en los extremos del carrusel.
- **Puntos de paginación** bajo el carrusel (indicador del grupo de slides activo, como en la referencia).
- Accesibilidad: `aria-label` en flechas, foco visible; donde aplique, soporte teclado.

### 3.4 Datos e implementación

- **Consulta sugerida**: `publicado == true`, `categoria == equipoActual.categoria`, excluir documento actual; `limit` acorde al diseño (ej. 12 ítems) y slice para slides de a 3 en desktop.
- **Estado actual en Marcos Morici**: la vista `EquipoDetalle` **aún no** incluye este bloque; este apartado fija requisitos para implementarlo sin omitir criterio de categoría ni UI.

---

## 4. Galería (requisitos UX/UI)

- Imagen principal con proporción estable (ej. 4:3 o similar).
- Miniaturas en **fila horizontal** con scroll si hay muchas fotos.
- Estado activo visible en la miniatura seleccionada (borde/ring).
- Accesibilidad: `aria-label` por miniatura, imagen principal con `alt` descriptivo.
- Fallback si no hay fotos: placeholder de marca (ya contemplado en código actual).

---

## 5. Tabla de características técnicas

### 5.1 Campos que muestra la referencia

Ejemplo extraído del listado público:

| Etiqueta (UI) | Ejemplo |
|---------------|---------|
| Marca | Caterpillar |
| Modelo | 313 GC |
| Año de fabricación | 2025 |
| Horas de uso | 200 |
| Peso total (Kg) | 13000 |
| Capacidad de balde (m³) | 0,6 |

### 5.2 Normalización de etiquetas

- Decidir **copy fijo** en español (ej. “Año de fabricación” vs “Año”) para consistencia SEO y pantalla.
- Valores numéricos con separadores `es-AR` donde aplique.

### 5.3 Modelo de datos vs pantalla

Los campos pueden ser:

- **Campos fijos** en Firestore (`marca`, `modelo`, `ano`, `horas`, `pesoTotalKg`, `capacidadBaldeM3`, …), o
- **Lista clave-valor** (`caracteristicas: { label: string, value: string }[]`) para flexibilidad industrial sin cambiar schema a cada rubro.

Para “no saltear nada”, conviene documentar **qué va en tabla fija** y **qué va en extras opcionales**.

---

## 6. Bloque PDF / folleto

- **Texto intro** (referencia): *VER CARACTERÍSTICAS TÉCNICAS EN EL FOLLETO* (énfasis tipográfico).
- **Acción**: “Descargar” + icono; enlace al archivo (HTTPS).
- **Producto**: URL al PDF (`folletoPdfUrl` o alias en Firestore ya contemplados en `equipoFromDoc`).
- Decisión pendiente: ¿**solo descarga** o también **iframe embebido**? (El proyecto actual puede mostrar iframe si la URL termina en `.pdf`.)

---

## 7. Modelo de datos (`Equipo`) — checklist

Campos ya contemplados en tipos / lectura Firestore (ver `lib/types/equipo.ts` y `lib/firebase/equipos.ts`):

| Campo | Uso en ficha |
|-------|----------------|
| `titulo`, `marca`, `modelo` | Título + tabla |
| `imagenes[]` | Galería |
| `precio`, `precioConsultar` | Precio / “Consultar valor” |
| `descripcion` | Texto largo |
| `ano`, `horas` | Tabla |
| `capacidadBaldeM3`, `pesoTotalKg` | Tabla |
| `categoria` | Subtítulo o filtro; opcional en tabla |
| `folletoPdfUrl` | Bloque PDF |
| `slug`, `publicado`, `destacado` | URL, visibilidad, badge |
| `createdAt` | “Publicado” (opcional en tabla vs referencia) |

**Ampliaciones típicas** si se quiere paridad con sitios grandes:

- `sku` o código interno de publicación.
- `stock` / disponibilidad (boolean o enum).
- `caracteristicasAdicionales[]` para specs fuera del set fijo.

---

## 8. Formulario “Crear / editar publicación” — gaps actuales

En la cuenta, el formulario actual cubre: marca, modelo, título opcional, categoría, año, horas, precio / consultar, descripción, imágenes (archivo y URLs), publicado.

**No solicita (y por tanto no persiste en alta vía cuenta)** según flujo actual:

- **PDF / folleto** (`folletoPdfUrl`) — subida a Storage o pegado de URL.
- **Peso total (kg)** — `pesoTotalKg`.
- **Capacidad de balde (m³)** — `capacidadBaldeM3`.
- **Destacado** (si se permite desde cuenta).
- **SKU** / código (si se define negocio).

Cualquier campo que exista en Firestore por importación/script pero no en el formulario generará fichas **incompletas en UI** hasta que el formulario y las reglas de Storage/Firestore lo permitan.

---

## 9. Estado del código actual vs esta especificación (resumen)

| Aspecto | Referencia / objetivo | Implementación actual (apunte) |
|---------|------------------------|--------------------------------|
| Orden en columna derecha | Título → precio → Consultar → descripción → PDF → tabla | Título arriba del grid; columna derecha: precio → specs → volver; **descripción y PDF debajo del grid** |
| CTA “Consultar” prominente | Botón ancho dedicado | Precio como texto; contacto en **panel aparte al final** |
| Tabla características | Bloque único al pie de la columna texto | Specs mezcladas **arriba** con precio en la misma columna |
| PDF | Texto + link teal “Descargar” compacto | Bloque “Documentación PDF” con posible iframe grande |
| Formulario alta | Incluir PDF y specs físicas | **No** incluye PDF ni peso ni balde |
| “También te puede interesar” | Carrusel por **misma categoría**, flechas y puntos | **No** existe en `EquipoDetalle` |

Este README no exige un único diseño final de tokens de color: debe respetarse la **paleta Marcos Morici** (`README_PALETA_COLORES.md`) al implementar el botón y el link tipo folleto.

---

## 10. Checklist de implementación (para desarrollo)

- [ ] Reordenar layout de `EquipoDetalle` (y subcomponentes) al orden de la §2.
- [ ] Añadir botón **Consultar** en columna derecha (acción unificada con WhatsApp / lead).
- [ ] Mover **descripción** y **PDF** arriba en la columna derecha (y tabla debajo), o documentar excepción móvil.
- [ ] Ajustar **EquipoDetallePdf** a variante compacta (texto + Descargar estilo referencia) + opción “ver PDF completo” si se mantiene iframe.
- [ ] Unificar **tabla de características** (filas con líneas); no duplicar specs sueltas fuera de la tabla salvo decisión de negocio.
- [ ] Extender **MisEquipoForm** + `MisEquipoInput` + `createMisEquipo` / `updateMisEquipo` para PDF (file upload), `pesoTotalKg`, `capacidadBaldeM3`.
- [ ] Reglas **Firestore / Storage** para subida de PDF por usuario (tamaño, tipo MIME).
- [ ] Probar ficha en **export estático** + rewrite Firebase (`/comprar/**`).
- [ ] Sección **“También te puede interesar”**: query por misma `categoria`, excluir equipo actual, carrusel con flechas y puntos (§3).
- [ ] (Opcional) SKU, stock u otros estados en tarjetas del carrusel.

---

## 11. Enlaces internos del repo

- Paleta y marca: `docs/README_PALETA_COLORES.md`
- Catálogo / referencia Vialmaq análisis: `docs/marcos-morici-tractores/README_COMPRAR_VIALMAQ.md`
- SEO / JSON-LD producto: `docs/marcos-morici-tractores/README_SEO.md`
- Tipos: `marcos-morici-tractores/lib/types/equipo.ts`
- Vista detalle: `marcos-morici-tractores/components/comprar/EquipoDetalle.tsx`

---

*Última actualización: documento redactado para cerrar el gap entre la referencia [vialmaq.com.ar/caterpillar-313gc](https://vialmaq.com.ar/caterpillar-313gc) y la implementación actual Marcos Morici.*
