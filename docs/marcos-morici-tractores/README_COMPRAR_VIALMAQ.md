# Página «Comprar» – Referencia Vialmaq, mapa de pantalla y plan de trabajo

**Referencia comercial:** [vialmaq.com.ar](https://vialmaq.com.ar/) (catálogo de equipos en venta).

**Proyecto:** Marcos Morici Tractores — ruta `/comprar`. Solo **venta**; sin carrito; cierre por **contacto / WhatsApp**.

Este documento une: (1) el análisis tipo Vialmaq, (2) el **mapa de la pantalla** que definimos (breadcrumb, barra de categorías con iconografía, filtros a la izquierda minimizables, orden a la derecha, cards al centro), y (3) el **orden sugerido** para implementar o pulir cada parte, indicando qué ya existe en código y qué falta o conviene mejorar.

Complementa [`README_VIALMAQ_ANALISIS.md`](./README_VIALMAQ_ANALISIS.md) y las guías de UX y color en **`docs/`**: [`README_UX_UI.md`](../README_UX_UI.md), [`README_PALETA_COLORES.md`](../README_PALETA_COLORES.md).

---

## 1. Mapa de la pantalla (de arriba hacia abajo, de izquierda a derecha)

Vialmaq y nuestra propuesta comparten una **jerarquía** muy clara. La tabla siguiente describe cada zona, el comportamiento esperado y el estado aproximado en el repo.

| Orden visual | Zona | Qué debe hacer el usuario | Referencia Vialmaq | Estado en Marcos Morici (código actual) |
|--------------|------|---------------------------|--------------------|-------------------------------------------|
| A | **Cabecera global** | Navegar, buscar en todo el sitio | Logo, menú, buscador «¿Qué estás buscando?» | Header global (fuera de este README); en catálogo hay búsqueda **dentro** del listado también. |
| B | **Migas de pan (breadcrumb)** | Saber dónde está; volver a Inicio o a Comprar | `Inicio > Comprar` | Implementado: `Breadcrumb` en `CatalogoClient.tsx`. En detalle: `Inicio > Comprar > [equipo]`. |
| C | **Intro / contexto** (opcional) | Entender el tono de la sección | Título o frase bajo el breadcrumb | Franja con copy breve bajo el breadcrumb. |
| D | **Barra superior de «tipos de máquina»** | Filtrar **rápido** por categoría viendo **icono o ilustración** + nombre | Fila horizontal con iconos line art + etiqueta | `CategoriaBar`: scroll horizontal, iconos **SVG line art** por palabra clave de categoría + «Todos». Categorías salen del **stock** (Firestore). |
| E | **Columna izquierda: «Filtrar por»** | Acotar por precio, marca, balde, año, horas, peso; bloques **plegables** | Sidebar Magento: orden y UI en **§5** ([quiero-comprar](https://vialmaq.com.ar/quiero-comprar)) | Desktop: aside sticky. Orden **§5.0**: Precio → Marca → Balde (si aplica) → Año → Horas → Peso. Bloques **plegables** (+/−); rangos con **slider doble** + conteo de equipos + **Aceptar** (borde navy / fondo blanco). Marca: búsqueda + checklist + «Ver más +». |
| F | **Columna principal (derecha del sidebar)** | Ver cuántos resultados hay, **ordenar**, buscar en catálogo, ver **cards** | Arriba: «Artículos 1–12 de…» + «Ordenar por» + grid; **abajo:** números de página + «Mostrar 12 por página» (ver **§5.7.1**) | Cabecera: **«Artículos X–Y de Z»** + orden + búsqueda; **pie:** `CatalogoPaginationBar` (números de página estilo Vialmaq, chevrons, **Mostrar 12/24/36 por página**); cards `EquipoCard` (§2.5). |
| G | **Cards de equipo** | Escanear foto + datos; ir al detalle | Imagen, título, specs, badge venta, precio | `EquipoCard`: imagen 4:3, título, año/horas con iconos, badge Venta (verde), precio o «Consultar valor», CTA «Ver equipo». Detalle en **§2.5**. |
| H | **Mobile** | Mismos filtros sin romper el layout | Drawer o acordeón | Botón «Filtros» abre **drawer** lateral con el mismo contenido que el sidebar. |
| I | **FAB WhatsApp** | Contacto rápido | Botón flotante | Alineado al resto del sitio (ver paleta / UX). |

**Diagrama lógico (desktop):**

```text
┌─────────────────────────────────────────────────────────────────┐
│  HEADER GLOBAL (logo, menú Comprar/Vender/Nosotros, búsqueda)    │
├─────────────────────────────────────────────────────────────────┤
│  BREADCRUMB: Inicio > Comprar                                    │
├─────────────────────────────────────────────────────────────────┤
│  Intro opcional (una línea de contexto)                          │
├─────────────────────────────────────────────────────────────────┤
│  BARRA CATEGORÍAS: [Todos] [icono Excavadora] [icono …]  →scroll │
├──────────────┬──────────────────────────────────────────────────┤
│  FILTRAR POR │  Mostrando …     [ Ordenar por ▼ ]                 │
│  (izquierda) │  Buscar en catálogo …                             │
│  bloques     ├──────────────────────────────────────────────────┤
│  minimizables│  ┌────┐ ┌────┐ ┌────┐                             │
│              │  │CARD│ │CARD│ │CARD│  …                          │
│              │  └────┘ └────┘ └────┘                             │
│              │  paginación pie del listado → §5.7.1                 │
└──────────────┴──────────────────────────────────────────────────┘
                                        [ WhatsApp FAB ]
```

---

## 2. Análisis por bloque (lo que pediste, en detalle)

### 2.1 Breadcrumb (migas de pan)

- **Función:** orientación y SEO secundario; enlaces claros a `Inicio` y `Comprar`.
- **Vialmaq:** aparece bajo el header en el flujo de catálogo.
- **Nosotros:** ya implementado. Mejora futura: `schema.org` BreadcrumbList si se prioriza SEO.

### 2.2 Filtros a la izquierda, varios ítems, **minimizables**

- **Función:** facetas sin competir visualmente con las cards. En Vialmaq el orden típico es: **precio → marca → capacidad de balde (m³) → año → horas de uso → peso total (kg)** — desglosado en **§5**.
- **Vialmaq:** bloques plegables; **slider doble + «N productos» + ACEPTAR** en rangos; marca con búsqueda, checklist con conteos y **«Ver más +»** (detalle en **§5.0–§5.6**).
- **Nosotros:** mismo orden **§5.0** en `CatalogoFiltrosForm`: secciones **plegables** (Precio y Marca abiertos por defecto; Año/Balde/Horas/Peso según datos). **Sliders dobles** (`CatalogoDualRange`) + texto **«N equipos»** + **Aceptar** secundario. Marca con placeholder tipo referencia y **Ver más +**. Facetas **balde / horas / peso** solo si hay datos (balde también según **§5.3** y categoría).
- **Gap anterior resuelto:** los bloques **Precio** y **Marca** ya son **plegables** como el resto.

### 2.3 A la derecha: «Ordenar por»

- **Función:** reordenar el mismo conjunto filtrado (sin cambiar facetas).
- **Vialmaq:** desplegable; default tipo «Sugeridos».
- **Nosotros:** `select` con Destacados primero, precio, año, horas, más recientes. Ubicado en la **cabecera de la columna de resultados** (arriba del grid), alineado con el contador — coherente con «derecha» en desktop; en móvil puede apilar debajo del contador.

### 2.4 Arriba de todo (bajo breadcrumb): filtro con **ilustraciones** de las máquinas

- **Función:** atajo **visual** a la categoría; muy típico en Vialmaq.
- **Nosotros:** `CategoriaBar` con **iconos vectoriales** (line art) que cambian según palabras clave en el nombre de categoría (excavadora, retropala, etc.). **Ilustraciones** más ricas (PNG/WebP, estilo único de marca) son un paso de diseño posterior: mismo componente, distintos assets o un mapa `categoriaId → imagen`.

#### 2.4.1 ¿Se pueden «bajar» las ilustraciones de la barra de Vialmaq?

**Técnicamente, sí:** en la página [quiero-comprar](https://vialmaq.com.ar/quiero-comprar) el HTML referencia PNG públicos (tema Magento + `media/`). Son ilustraciones tipo ~100×97 px, no los SVG del código nuestro.

**Derechos de autor y marca:** esos archivos son contenido del sitio Vialmaq / su agencia (p. ej. tema Rollpix). **No conviene copiarlos al sitio de Marcos Morici** sin **permiso explícito** por escrito: riesgo legal y de confusión de marca. Usalos solo como **referencia visual** o moodboard interno.

**URLs exactas detectadas (mayo 2026, pueden cambiar si ellos renombran archivos):**

| Categoría (etiqueta en sitio) | URL del PNG |
|-------------------------------|---------------|
| Excavadoras | `https://vialmaq.com.ar/media/.renditions/catalog/category/ic-excavadora.png` |
| Retropalas | `https://vialmaq.com.ar/media/.renditions/catalog/category/ic-retropalas.png` |
| Cargadoras | `https://vialmaq.com.ar/media/.renditions/catalog/category/ic-cargadoras.png` |
| Minicargadoras | `https://vialmaq.com.ar/media/.renditions/catalog/category/ic-minicargadora.png` |
| Compactación | `https://vialmaq.com.ar/media/.renditions/catalog/category/ic-compactacion.png` |
| Motoniveladoras | `https://vialmaq.com.ar/media/.renditions/catalog/category/ic-motoniveladora.png` |
| Topadoras | `https://vialmaq.com.ar/media/.renditions/catalog/category/ic-topadoras.png` |
| Otros | `https://vialmaq.com.ar/media/wysiwyg/ic-otros.png` (en el HTML también aparece variante con doble barra `media//wysiwyg/`; conviene la URL canónica sin doble `/`). |

En **desktop**, Vialmaq usa otra fila (Page Builder) con los mismos u otros assets; las rutas anteriores bastan para identificar el set de iconos de categoría.

**Alternativas recomendadas para producción:** ilustraciones propias o comisionadas a un diseñador; packs de stock con licencia comercial; o seguir con **SVG propios** (como hoy `CategoriaBar.tsx`) hasta tener assets finales.

### 2.5 Centro / a la derecha: cards con información y foto

- **Función:** escaneo rápido; clic en imagen, título o CTA → detalle en **`/comprar/[slug]`** (`EquipoDetalle`); la query `?equipo=` redirige a la misma ruta.
- **Implementación:** `components/comprar/EquipoCard.tsx`.

#### 2.5.1 Referencia visual — card en [quiero-comprar](https://vialmaq.com.ar/quiero-comprar)

En el listado de Vialmaq (Magento), cada ítem se presenta como una **tarjeta vertical** con jerarquía muy clara; sirve de benchmark de contenido, no de colores de marca.

| Zona (arriba → abajo) | Contenido típico | Comportamiento / notas |
|----------------------|------------------|-------------------------|
| **Imagen** | Foto del equipo (ej. excavadora en faena) | Ocupa la mayor parte del alto de la card; esquinas superiores redondeadas con el contenedor; ratio visual “foto dominante”. |
| **Título** | Marca y modelo en **mayúsculas** (ej. `CATERPILLAR 313GC`) | Texto fuerte, alineado a la izquierda; identidad del listado. |
| **Metadatos** | **Año** (ej. `2025`) y **horas** (ej. `200 hs.`) | En la referencia suelen leerse en línea o en bloque compacto junto al título; datos grises secundarios. |
| **Estado comercial** | Pill / etiqueta **«Venta»** | En el sitio de referencia suele ir resaltada en **amarillo** (identidad Vialmaq), no como CTA principal. |
| **Precio** | Formato **US$** con separadores locales (ej. `US$ 115.000,00`) | Tipografía grande y negrita; ancla visual inferior-derecha o bajo los metadatos según el tema. |
| **Acción secundaria** | Botón **«Consultar»** o **«Comprar»** según disponibilidad | No todas las filas usan la misma etiqueta; depende de configuración de producto en la tienda. |

**Ejemplo de lectura humana** (mismo orden que en catálogo público): imagen → `CATERPILLAR 313GC` → `2025` · `200 hs.` → badge Venta → `US$ 115.000,00` → Consultar.

#### 2.5.2 Anatomía de nuestra card (`EquipoCard`)

Contenedor: `<article>` con **fondo blanco**, `rounded-lg`, **borde** `#E0E5E9`, **sombra** suave (`shadow-sm`) y `hover:shadow-md` para feedback al pasar el mouse.

| Bloque | Elemento técnico | Contenido / estilo |
|--------|------------------|-------------------|
| **Media** | `Link` + `next/image` con `fill`, `aspect-[4/3]`, `object-cover` | Primera URL en `equipo.imagenes[0]`; si no hay, **fallback** a `/logo/Logo Nav Bar.png`. Fondo de placeholder `#F0F3F6`. `loading="lazy"`, `sizes` responsive. Toda la zona imagen enlaza al detalle. |
| **Cabecera de texto** | `Link` + `<h2>` a ancho completo bajo la imagen | **Título:** `equipo.titulo` o `marca` + `modelo` — `text-lg`, negrita, **mayúsculas** (`uppercase`), navy `#1E3A5F`, hover verde `#4A7C59`. |
| **Fila metadatos + precio** | `flex justify-between` bajo el título | **Izquierda:** año y/o horas con iconos (§2.5.2 celdas siguientes). **Derecha:** badge «Venta» + bloque de precio alineados a la derecha (`items-end`). |
| **Especificaciones** | Columna izquierda | **Año** y **horas** con iconos en `text-sm` gris `#5A6C7D`; altura mínima si faltan ambos para alinear cards en el grid. |
| **Estado + precio** | Columna derecha | Badge **«Venta»** pill con **borde verde** `#4A7C59` y texto verde. **Precio** debajo (`text-xl` negrita navy) o **«Consultar valor»**. |
| **CTA** | `Link` ancho completo | Texto **«Ver equipo»**; borde 2px navy, hover **naranja** `#D9773F` relleno + texto blanco ([`README_PALETA_COLORES.md`](../README_PALETA_COLORES.md)). Enlaza a la misma query de detalle que imagen y título. |

**Rutas de interacción:** tres superficies llevan al detalle — imagen, título y botón «Ver equipo» — todas con `?equipo=<slug>` codificado.

#### 2.5.3 Datos de Firestore / tipo `Equipo` usados en la card

| Campo / lógica | Uso en UI |
|----------------|-----------|
| `imagenes[]` | Solo el primer elemento para la miniatura. |
| `titulo`, `marca`, `modelo` | Título visible (prioridad a `titulo`). |
| `ano` | Oculta la fila del calendario si es `null`. |
| `horas` | Oculta la fila del reloj si es `null`. |
| `precio`, `precioConsultar` | Ver celda «Estado + precio» en §2.5.2. |
| `slug` | Query string del detalle. |

Otros campos del modelo (categoría, peso, balde, etc.) **no** se muestran en la card; van al detalle o a filtros.

#### 2.5.4 Paridad y diferencias respecto a Vialmaq

| Aspecto | Vialmaq (referencia) | Marcos Morici (`EquipoCard`) |
|---------|----------------------|------------------------------|
| Badge venta | Amarillo / borde amarillo (marca sitio) | Verde: **pill con borde** `#4A7C59` (texto verde; no relleno sólido) |
| CTA en listado | «Consultar» / «Comprar» variable | Siempre «Ver equipo» (venta sin checkout) |
| Ratio imagen | Fotografía dominante en card alta | **4:3** fijo (`aspect-[4/3]`) |
| Precio ausente | Puede mostrar solo botón de acción | Texto explícito **«Consultar valor»** |
| Columnas internas | A veces sensación “specs izquierda / precio derecha” en el tema | Misma **fila en dos columnas** bajo el título (specs | badge + precio); CTA ancho completo al pie |

#### 2.5.5 Mejoras posibles (no implementadas)

- Segunda imagen o carrusel en **hover** / touch.
- Badge **«Destacado»** si el documento expone un flag.
- **Favoritos** (requiere auth o localStorage + UX).
- Skeleton mientras carga la imagen (coherente con §3 fase 10).

---

## 3. Orden recomendado de trabajo (roadmap)

Seguir este orden reduce retrabajo: primero **layout y navegación**, después **filtros profundos**, después **contenido visual** y **pulido**.

| Fase | Prioridad | Tarea | Notas |
|------|-----------|-------|--------|
| **1** | Alta | Layout catálogo: breadcrumb + barra categorías + dos columnas (filtros \| resultados) + responsive | Gran parte hecha; revisar breakpoints y sticky del aside. |
| **2** | Alta | Barra de categorías con iconografía clara y estado activo | Hecha con SVG; opcional: sustituir por ilustraciones o fotos recortadas. |
| **3** | Alta | Columna resultados: contador + **Ordenar por** + grid de cards + paginación | Hecha; validar copy y opciones de sort con negocio. |
| **4** | Alta | Cards: foto, datos, precio, CTA, enlace a detalle | Hecha; revisar ratio de imagen y fallback si no hay foto. |
| **5** | Media | Sidebar: **todos los bloques minimizables** (Precio, Marca, Año) con mismo patrón UI | Año ya es acordeón; extender a Precio y Marca. |
| **6** | Media | Paridad Vialmaq en **rango de precio**: sliders dobles o equivalente accesible + «Aceptar» | Hoy son inputs numéricos; mejora UX. |
| **7** | Media | **Capacidad de balde**, **horas de uso** y **peso total (kg)** como en Vialmaq (rangos + Aceptar) si Firestore tiene los datos | Ocultar facetas que no apliquen a la categoría seleccionada. |
| **8** | Media | **Chips** de filtros activos + «Borrar todo» (móvil y desktop) | Chips ya presentes; revisar visibilidad y orden. |
| **9** | Media | Detalle de equipo + WhatsApp con mensaje prellenado | Ver `EquipoDetalle` y variables de entorno. |
| **10** | Baja | Estados vacíos, error de red, skeletons | Parcialmente cubierto; unificar mensajes. |
| **11** | Baja | SEO: `title`/`description` de `/comprar`, URLs limpias si se pasa de query a rutas (`/comprar/[slug]`) | Decisión de routing. |
| **12** | Baja | Búsqueda global en header vs búsqueda en catálogo: misma lógica o query params compartidos | Evitar duplicar comportamiento contradictorio. |

**Resumen en una frase:** primero dejar **clara la estructura** (migas → categorías visuales → filtros laterales + resultados); luego **homogeneizar filtros plegables** y sliders; después **riqueza visual** (ilustraciones) y **pulido** (SEO, estados, header).

---

## 4. Propósito de la página

- Inventario **filtrable** de maquinaria en venta.
- Acotar por categoría, precio, marca, año (y facetas extra cuando existan datos).
- Llevar a **detalle** y a **consulta** (WhatsApp / teléfono), no a checkout.

---

## 5. Detalle de filtros tipo Vialmaq (especificación)

Referencia revisada contra la tienda en **[vialmaq.com.ar/quiero-comprar](https://vialmaq.com.ar/quiero-comprar)** (Magento). Los números de productos, marcas y rangos **varían con el inventario**; lo siguiente describe **patrones de UI y un ejemplo** tomado de la página y capturas (mayo 2026).

### 5.0 Panel lateral «Filtrar por» — estructura general

- **Ubicación:** columna izquierda del listado de compra (desktop); en móvil suele equivaler a drawer/off-canvas según tema.
- **Título del bloque:** **Filtrar por** (tipografía destacada).
- **Patrón por faceta:**
  - **Cabecera de sección** en mayúsculas (ej. **PRECIO**, **MARCA**) con control para **expandir/contraer** (icono flecha arriba ↔ abajo según estado).
  - Las facetas de **rango numérico** comparten el mismo esquema: línea con **valores min/max visibles**, **slider horizontal de dos mangos** (rango), texto con **«N productos»** que encajan en ese rango (preview antes de aplicar), y botón **ACEPTAR** para **confirmar** el filtro (evita recalcular el catálogo en cada pixel de arrastre).
  - Estilo visual del slider en referencia: **barra gris**, **mangos circulares en amarillo** (marca Vialmaq).
  - Botón **ACEPTAR:** aspecto tipo secundario — **fondo blanco, borde oscuro, texto en mayúsculas**.
- **Orden de las facetas** tal como aparecen en el HTML público de la página de compra (de arriba hacia abajo):
  1. **Precio** (+ Aceptar en rangos).
  2. **Marca** (lista; sin botón Aceptar explícito en el mismo patrón que los rangos — suele aplicar al marcar).
  3. **Capacidad de balde (m³)** (+ Aceptar).
  4. **Año de fabricación** (+ Aceptar).
  5. **Horas de uso** (+ Aceptar).
  6. **Peso total (Kg)** (+ Aceptar).

### 5.1 Precio (USD)

- **Slider doble** acotado al **mínimo y máximo del catálogo actual** (los extremos del slider muestran esos valores formateados, ej. estilo **US$ 32.600,00** … **US$ 380.000,99**).
- Debajo: **conteo de productos** dentro del rango seleccionado en el slider (ej. **«43 productos»** cuando el rango coincide con todo el universo visible en ese momento).
- **ACEPTAR** aplica el filtro de precio.
- **Nota de implementación:** mismo criterio que en el resto de rangos — aplicar al clic en Aceptar, no en cada `input` del slider (mejor rendimiento y menos saltos en la lista).

### 5.2 Marca

- **Campo de búsqueda** dentro del bloque para acortar la lista (placeholder de referencia en el sitio: texto tipo *«Buscar (Carterpillar, Komatsu, …)»* — en el sitio aparece así, con variante «Carterpillar» respecto al nombre usual «Caterpillar»).
- **Lista en checklist:** cada fila = marca + **conteo entre paréntesis** (ej. **CATERPILLAR (14)**, **Komatsu (5)**, **Bomag (4)**, **Hyundai (4)**, **John Deere (3)**, **Case (2)**, **Liugong (2)**, **SDLG (2)**, **Doosan/Develon (1)**, **Hamm (1)** — ejemplo según inventario en captura; **no hardcodear** en producción).
- Enlace **«Ver más +»** cuando hay más marcas de las que caben en el primer pantallazo (expande la lista sin salir de la página).
- Los conteos deben ser **coherentes con el resto de filtros activos** (facetado), igual que en un típico layered navigation de Magento.

### 5.3 Capacidad de balde (m³)

- Bloque de **rango** en metros cúbicos: ej. **0 m³** … **5 m³** con **slider doble** + **«N productos»** + **ACEPTAR**.
- Solo una **parte del catálogo** suele tener dato de balde; por eso el **conteo puede ser menor** que el total de artículos (ej. **«21 productos»** frente a 43 ítems en listado — ejemplo de captura).
- En Marcos Morici: mostrar solo si existe campo en Firestore y **tiene sentido por categoría** (p. ej. excavadoras/cargadoras).

### 5.4 Año de fabricación

- Bloque **plegable** (puede ir **colapsado** por defecto para reducir ruido).
- Misma idea de **rango + ACEPTAR** que precio y balde (años mín/máx según stock).

### 5.5 Horas de uso

- Faceta **de rango** con **ACEPTAR** (horas máquina), en el mismo patrón que precio / año / balde.
- En la referencia el bloque puede ir **colapsado** inicialmente.

### 5.6 Peso total (Kg)

- Faceta **de rango** con **ACEPTAR**, pensada para maquinaria pesada.
- Aparece en la página de compra como sexto bloque del sidebar (junto al resto listado en §5.0).

### 5.7 Cabecera de resultados (fuera del sidebar)

En [quiero-comprar](https://vialmaq.com.ar/quiero-comprar), la **cabecera** del bloque de resultados (sobre el grid) concentra el contexto del listado y el orden; el **pie** del grid lleva otra franja de controles (captura de referencia, §5.7.1).

- Texto tipo **«Artículos 1–12 de 43»** que resume rango visible y total (coherente con el **page size** elegido abajo).
- **Ordenar por:** opciones como **Sugeridos**, **Nombre del producto**, **Precio**, más control de **dirección** ascendente/descendente según el selector del tema.
- Para Marcos Morici se alinea el espíritu con **destacados / precio / año / horas / recientes** (`CatalogoClient`), sin copiar literal cada etiqueta de Magento.

#### 5.7.1 Pie del listado en Vialmaq — paginación numérica y «Mostrar … por página»

Descripción según **screenshot** de la barra horizontal bajo el grid en la misma página de compra (Magento). Es un patrón de **dos extremos** en una sola fila (`space-between` visual): a la **izquierda** la navegación por páginas; a la **derecha** el tamaño de página.

**Bloque izquierdo — páginas**

| Elemento | Comportamiento / aspecto en la referencia |
|----------|-------------------------------------------|
| **Botones cuadrados por número** | Cada página es un control tipo **cuadrado** con borde suave; tipografía sans-serif en gris oscuro sobre fondo blanco cuando está **inactiva**. |
| **Página activa** | El botón de la página corriente (ej. **«1»**) lleva **fondo gris oscuro** y el dígito en **color claro** (amarillo muy pálido / off-white en el tema), de modo que el estado actual destaca frente al resto. |
| **Páginas inactivas** | Fondo **blanco**, **borde gris claro**, número en **gris oscuro** (ej. 2, 3, 4 en la captura). |
| **«Siguiente»** | Tras los números visibles aparece un control con **chevron hacia la derecha** (`>`) para avanzar sin mostrar aún todas las páginas intermedias (complemento típico a la lista acotada de números). |

**Bloque derecho — densidad del listado**

| Elemento | Texto / control |
|----------|-----------------|
| **Etiqueta** | **Mostrar** (a la izquierda del selector). |
| **Selector** | Caja **rectangular** con borde gris claro, valor numérico visible (ej. **12**) y **chevron hacia abajo** — comportamiento de `<select>` o widget equivalente del tema. |
| **Sufijo** | **por página** (a la derecha del selector). |

**Opciones habituales de page size** en esa misma zona del catálogo Vialmaq: **12**, **24**, **36** (ya citadas en §5.7; el desplegable permite cambiar cuántos productos se renderizan antes de pasar de página).

**Implementación en Marcos Morici:** `CatalogoPaginationBar.tsx` bajo el grid (`CatalogoEquiposList.tsx`), con `pageSize` en estado en `useCatalogoEquipos.ts` y valores **12 / 24 / 36** en `lib/catalog/constants.ts`. La página activa usa **fondo gris oscuro** y texto **claro**; páginas inactivas, **borde gris** y texto oscuro; chevrons prev/next; selector **Mostrar … por página** a la derecha. La cabecera de resultados usa el texto **«Artículos X–Y de Z»** (`CatalogoToolbar.tsx`).

### 5.8 Grid de cards

- Responsive: 1 col móvil, 2 tablet, 3 desktop típico.
- **Anatomía de cada card** (referencia Vialmaq + implementación `EquipoCard`): ver **§2.5** (subapartados 2.5.1–2.5.5). Documentación UX general: [`README_UX_UI.md`](../README_UX_UI.md).

---

## 6. Modelo de datos (facetas)

Campos útiles para la UI descrita:

| Campo (conceptual) | Uso |
|--------------------|-----|
| `categoria` / tipo | Barra superior ilustrada / iconos |
| `marca` | Checklist + conteos |
| `precio` / `precioConsultar` | Rango + card |
| `ano` | Acordeón / rango año |
| `horas` | Card + ordenación + **filtro por rango** (patrón Vialmaq §5.5) |
| `destacado` / orden | «Destacados primero» |
| `slug` | Detalle |
| `capacidadBaldeM3` | Filtro condicional por categoría (§5.3) |
| `pesoTotalKg` | Filtro por rango (§5.6), si existe en datos |

Los conteos por marca no deben estar hardcodeados; deben calcularse sobre el conjunto publicado.

---

## 7. Identidad Marcos Morici (resumen)

- No replicar el amarillo marketplace de Vialmaq: usar **navy** `#1E3A5F`, **verde** `#4A7C59`, **naranja** `#D9773F` en acentos y CTAs (detalle en [`README_PALETA_COLORES.md`](../README_PALETA_COLORES.md)).
- Badge **VENTA** en verde; CTA **Ver equipo** / **Consultar por WhatsApp** en detalle.
- Navegación principal: **Comprar · Vender · Nosotros** (sin Alquilar, salvo que el negocio cambie).

---

## 8. Checklist rápido de implementación

- [x] Ruta `/comprar` con layout dos columnas + responsive.
- [x] Migas `Inicio > Comprar` (y variante en detalle).
- [x] Barra de categorías con iconos y estado activo.
- [x] Sidebar: precio, marca (búsqueda + checks + conteos + ver más), año (acordeón).
- [x] Sidebar: **todos los bloques minimizables** (Precio, Marca, Año, …) con patrón §5.
- [x] Sliders de rango (precio / año / horas / balde / peso) + «Aceptar» secundario + conteo previo.
- [x] Cabecera de resultados + ordenación.
- [x] Grid de cards según marca (badge verde, CTA «Ver equipo»).
- [x] Integración Firestore + detalle por slug.
- [x] Drawer filtros en móvil.
- [ ] FAB / flujo WhatsApp revisado en conjunto con el sitio.
- [ ] SEO catálogo + estados vacíos/error unificados.
- [ ] Ilustraciones por categoría (sustituir o complementar SVG).

---

## 9. Referencias en el código

| Pieza | Archivo principal |
|-------|-------------------|
| Página catálogo | `app/comprar/page.tsx` |
| **Ficha equipo (SEO + export)** | `app/comprar/[slug]/page.tsx` (`generateMetadata`, `generateStaticParams`, JSON-LD) |
| Redirección `?equipo=` → `/comprar/slug` | `components/comprar/ComprarEquipoQueryRedirect.tsx` |
| Orquestación UI | `components/comprar/CatalogoClient.tsx` |
| Grid, cards y pie de paginación | `components/comprar/CatalogoEquiposList.tsx` |
| Barra **Mostrar / página** + números de página | `components/comprar/CatalogoPaginationBar.tsx` |
| Tamaños de página 12 / 24 / 36 | `lib/catalog/constants.ts` + estado en `useCatalogoEquipos.ts` |
| Categorías + iconos | `components/comprar/CategoriaBar.tsx` |
| Card | `components/comprar/EquipoCard.tsx` |
| Detalle (layout ficha) | `components/comprar/EquipoDetalle.tsx` |
| Galería / PDF / contacto+oferta+chat | `EquipoDetalleGaleria.tsx`, `EquipoDetallePdf.tsx`, `EquipoDetalleContactoPanel.tsx` |
| JSON-LD `Product` | `lib/seo/productJsonLd.ts` |
| Leads desde ficha | `lib/firebase/equipoContacto.ts` |
| Filtros / sort | `lib/catalog/catalogUtils.ts` |
| Tipos | `lib/types/equipo.ts` |
| Datos | `lib/firebase/equipos.ts` |

---

## 10. Referencias cruzadas

- [`README_VIALMAQ_ANALISIS.md`](./README_VIALMAQ_ANALISIS.md) — rutas y modelo base.
- [`README_ENV.md`](./README_ENV.md) — variables (Firebase, WhatsApp, etc.).
- [`README_UX_UI.md`](../README_UX_UI.md) / [`README_PALETA_COLORES.md`](../README_PALETA_COLORES.md) (`docs/`) — header, cards, colores.

---

*Documento actualizado: mapa de pantalla + **§5** con panel «Filtrar por» descrito según [quiero-comprar](https://vialmaq.com.ar/quiero-comprar) y UI observada (mayo 2026); **§2.5** con anatomía detallada de las cards; **§5.7.1** con el pie de listado Vialmaq (paginación numérica + «Mostrar … por página») según captura de pantalla. Los conteos y rangos del catálogo vivo pueden diferir.*
