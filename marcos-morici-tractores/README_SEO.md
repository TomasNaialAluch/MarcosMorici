# Guía SEO — análisis de referencia (VIALMAQ) y checklist para Marcos Morici

Este documento resume qué hace bien y qué no una tienda de maquinaria similar ([VIALMAQ](https://vialmaq.com.ar/)), y qué conviene implementar en **vuestra** web (Next.js) para competir en Google de forma sostenible.

---

## 1. Qué mirar cuando hablamos de SEO

| Capa | Qué es |
|------|--------|
| **Técnico** | Que Google pueda rastrear e indexar (robots, sitemap, URLs, velocidad, HTTPS, datos estructurados). |
| **Contenido** | Títulos, descripciones, textos útiles, fichas de producto, preguntas frecuentes, ubicación y servicios. |
| **Experiencia** | Rapidez en móvil, diseño usable, enlaces claros (también entra en señales de ranking). |
| **Autoridad / reputación** | Menciones, enlaces de calidad, perfil de negocio local, reseñas — se construye con el tiempo. |

No existe un “truco único”: Google premia sitios **útiles, claros y fiables** para la intención de búsqueda (ej. “retroexcavadora usada Buenos Aires”).

---

## 2. Análisis SEO de la home de VIALMAQ (referencia)

**Plataforma:** Magento 2 (e-commerce clásico con catálogo, carrito, cuenta).

### Lo que ayuda al SEO (replicable)

- **`lang="es"`** en `<html>`: indica idioma al buscador.
- **`robots` INDEX, FOLLOW**: la home permite indexación y seguimiento de enlaces.
- **Viewport móvil** y **favicon**: base correcta para resultados y UX.
- **URLs de producto legibles** (ej. `/caterpillar-313gc`, `/komatsu-pc210`): buenas para compartir y para palabras clave en la URL.
- **Enlaces internos visibles** hacia “Comprar / Alquilar / Vender” y listados de equipos: Google descubre el catálogo siguiendo enlaces.
- **Imágenes de producto con contexto** (nombre del equipo en enlaces y estructura de tarjetas): facilita entender de qué trata cada URL.
- **Google Tag Manager**: no es SEO directo, pero permite medir tráfico y conversiones para optimizar con datos.

### Debilidades detectadas en la home (oportunidad para vosotros)

- **`<title>` muy genérico:** solo “VIALMAQ”. En Google suele mostrarse el título del snippet; sin oferta ni ubicación pierde clics frente a un título más descriptivo.
- **Sin `<meta name="description">` visible** en el HTML inicial de la home: Google inventa el snippet; perdés control del mensaje en resultados.
- **Sin meta Open Graph / Twitter Card** evidentes en el `<head>`: al compartir en WhatsApp/redes el preview suele ser peor.
- **Sin datos estructurados obvios** (JSON-LD `Organization`, `WebSite`, `Product`) en la porción analizada: se pierden rich results y claridad para el buscador.
- **E-commerce con mucho JavaScript y CSS**: típico de Magento; si no está bien optimizado, puede afectar **Core Web Vitals** (LCP, INP) frente a un sitio más liviano.
- **Coherencia URL ↔ producto:** en catálogo puede verse un equipo con nombre X y URL que no coincide (ej. slugs reutilizados o importaciones): mal señal para usuarios y para consistencia temática.
- **Contenido repetido o poco semántico** (avisos de cookies, textos de UI) no suma valor para búsquedas informativas.

**Conclusión:** VIALMAQ gana por **marca + catálogo + antigüedad del dominio + volumen de URLs**; la home en sí **no está optimizada al máximo** en metadatos y datos estructurados. Ahí podéis **igualar o superar** con una implementación limpia en Next.js.

---

## 3. Qué ya tenéis bien en Marcos Morici (Next.js)

En el proyecto actual (revisión de código):

- **Título y descripción** en `app/layout.tsx` y en `app/comprar/layout.tsx` son **más descriptivos** que la home de VIALMAQ (marca + actividad + propuesta).
- **`lang="es"`** en el documento.
- **`/nosotros`** y **`/vender`**: buen uso de **un solo `h1`** y jerarquía `h2`–`h3` donde aplica.
- **`/comprar`** (vista detalle): **`h1`** alineado al nombre del equipo en `EquipoDetalle`.
- **Tarjetas de catálogo**: `alt` en imagen con el título del equipo (`EquipoCard`).
- **Migas de pan** (`Breadcrumb`) en comprar, vender y nosotros: ayuda a usuarios y a rastreo contextual.

Lo que **no** está cubierto aún a nivel sitio (véase **§8**): metadatos por URL de ficha, rutas canónicas de producto, `openGraph` / Twitter, `robots.txt`, `sitemap`, JSON-LD, `noindex` en área privada, y contenido indexable en la home.

---

## 4. Checklist: hacer “lo mismo” que un marketplace serio (en SEO técnico)

### Por página (home, categorías, fichas)

- [ ] **`<title>` único** (≈50–60 caracteres): marca + servicio + zona si aplica (ej. “Comprar tractores usados | Zona X | Marcos Morici”).
- [ ] **Meta description** (≈150–160 caracteres): beneficio + llamada a la acción; no relleno de keywords.
- [ ] **Un solo `<h1>`** por página, alineado con la intención de búsqueda.
- [ ] **Jerarquía `h2`–`h3`** para secciones (catálogo, cómo comprar, garantía, contacto).
- [ ] **URL estable y legible** por equipo; evitar cambiar slugs sin redirección 301.

### Sitio completo

- [ ] **`robots.txt`** accesible y coherente con lo que queréis indexar.
- [ ] **`sitemap.xml`** (idealmente generado en build o ruta dinámica) con URLs de fichas importantes.
- [ ] **`canonical`** en fichas con parámetros o filtros para evitar duplicados.
- [ ] **`openGraph` y `twitter`** en `metadata` de Next para previews al compartir.

### Datos estructurados (JSON-LD)

- [ ] **`Organization`** (o `LocalBusiness` si tenéis dirección y horario): nombre, logo, teléfono, `sameAs` (redes).
- [ ] **`WebSite`** con `potentialAction` tipo `SearchAction` si tenéis buscador interno.
- [ ] **Por producto:** `Product` + `Offer` (precio, moneda, disponibilidad) cuando los datos sean fiables.

### Imágenes y accesibilidad

- [ ] **`alt` descriptivo** por imagen (modelo + contexto), sin keyword stuffing.
- [ ] Formatos modernos y tamaños razonables donde el framework lo permita.

### Rendimiento (impacta SEO indirectamente)

- [ ] Buen **LCP** en móvil (imagen hero y fuentes optimizadas).
- [ ] Menos JS innecesario en la primera carga en páginas de listado.

### Local (Argentina)

- [ ] Texto natural con **ciudad/región** y “Argentina” donde sea verdad (footer, página contacto, fichas).
- [ ] **Google Business Profile** alineado con nombre, teléfono y web.
- [ ] **NAP consistente** (nombre, dirección, teléfono) en web y directorios relevantes.

---

## 5. Mejoras prioritarias para salir mejor en Google (orden sugerido)

1. **Fichas de producto como página SEO:** título = modelo + estado (usado/nuevo) + año si aplica; descripción con horas, mantenimiento, ubicación de entrega; FAQ corta (“¿Financiación?”, “¿Envío?”).
2. **Páginas de categoría** (“Retroexcavadoras”, “Pala cargadora”, etc.) con texto introductorio útil (no solo grid), enlaces a subcategorías y a equipos destacados.
3. **Metadatos dinámicos** en Next (`generateMetadata`) leyendo Firebase/datos del equipo: evitáis títulos duplicados tipo “Equipo sin nombre”.
4. **Evitar contenido duplicado** entre listados y fichas; si hay poco texto, añadí bloques únicos por equipo.
5. **Enlaces internos:** desde la home y categorías hacia equipos nuevos; desde fichas hacia categorías relacionadas.
6. **Medición:** Search Console + analítica; corregir errores de indexación y mejorar páginas con impresiones pero pocos clics (CTR).
7. **E-E-A-T ligero al rubro:** quiénes son, experiencia, cómo inspeccionan máquinas, datos de contacto visibles (genera confianza y coincide con lo que Google valora en YMYL/comercio).

---

## 6. Herramientas útiles (gratuitas o freemium)

- [Google Search Console](https://search.google.com/search-console) — indexación, consultas, CTR.
- [PageSpeed Insights](https://pagespeed.web.dev/) — Core Web Vitals y sugerencias.
- [Rich Results Test](https://search.google.com/test/rich-results) — validar JSON-LD.

---

## 7. Resumen ejecutivo

- **VIALMAQ** aporta volumen de catálogo y URLs de producto; la **home** mejorable en título, descripción, redes sociales preview y datos estructurados.
- **Vuestra ventaja:** stack moderno (Next) para **metadata por ruta**, velocidad y mantenimiento; con **fichas ricas + sitemap + JSON-LD** podéis competir muy bien en long-tail (“marca modelo usado Argentina”).
- El SEO fuerte en maquinaria es **muchas landing útiles** (categoría + producto + local), no solo una home bonita.

---

## 8. Auditoría página por página (estado del repo)

Referencias del checklist: **§4** (técnico), **§5** (prioridades). Abajo: **qué falta anotado por ruta** según el código actual (`app/`, componentes vinculados). No incluye implementación; solo brechas.

### Sitio completo (afecta a todas las páginas)

| Tema | Estado / brecha |
|------|------------------|
| **`metadata` Open Graph y Twitter** | No definidos en `app/layout.tsx` ni en layouts hijos: al compartir cualquier URL el preview será pobre (§4). |
| **JSON-LD** | Sin `Organization` / `LocalBusiness` / `WebSite` / `Product` en layout o rutas (§4). |
| **`robots.txt` / `sitemap.xml`** | No hay `app/robots.ts` ni `app/sitemap.ts` (ni equivalente): Google no recibe mapa explícito de URLs (§4). |
| **`favicon` / iconos** | No hay `app/icon.*` en el árbol revisado; conviene icono estable para resultados y pestañas. |
| **`lang`** | `es` está bien; para Argentina valorar `es-AR` si queréis máxima precisión regional (opcional). |
| **Footer** | Solo copyright: faltan **NAP** (nombre/dirección/teléfono), enlaces a secciones clave y texto local (§4 Local). |
| **Loader largo en entrada** | Secuencia de varios segundos antes de estabilizar UI: puede empeorar percepción de velocidad y **LCP** (§4 Rendimiento). |

---

### `/` — Home (`app/page.tsx`)

| Elemento | Estado | Qué falta (SEO / contenido) |
|----------|--------|------------------------------|
| Contenido HTML | **`page.tsx` devuelve un contenedor vacío** | Sin texto, sin `h1`, sin enlaces destacados al catálogo: para Google la home es casi **página en blanco**; no compite por intenciones (“tractores usados”, marca, zona). |
| Título / descripción | Heredan de `app/layout.tsx` | Afinar **title + description** específicos de home (propuesta + zona/servicio) cuando exista contenido real (§4). |
| Enlaces internos | Solo vía Header global | Añadir en el cuerpo bloques con enlaces a `/comprar`, `/vender`, `/nosotros` (y eventualmente categorías) para refuerzo de rastreo (§5 punto 5). |
| Imágenes / hero | No hay en la página | Cuando se diseñe la home: hero con `alt` descriptivo, prioridad de carga para LCP (§4). |

---

### `/comprar` — Catálogo (lista) (`app/comprar/page.tsx` + `CatalogoClient`)

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| Metadata | `app/comprar/layout.tsx`: title + description | Añadir **openGraph** / **twitter**. |
| **`h1` en vista lista** | No hay `h1` visible: hay párrafo intro, **`h2` “Filtrar por”** en lateral | Un **`h1`** único alineado a “Comprar maquinaria” / “Catálogo de equipos” (§4). |
| Texto introductorio | Breve párrafo en franja | Ampliar con **valor único** (ubicación, tipo de stock, CTA) y, si aplica, mención **Argentina/región** (§4 Local). |
| URLs con filtros / búsqueda | `?q=`, chips de categoría y filtros vía estado cliente | Riesgo de **URLs duplicadas** o variantes indexables: definir **canonical** hacia `/comprar` o hacia URL base cuando los filtros no aporten landing única (§4). |
| Paginación | Estado en cliente (sin reflejo en la URL en el código actual) | Google **solo ve una URL** `/comprar` para el listado completo; las páginas 2+ no son indexables por separado salvo que más adelante **reflejen la paginación en la URL** (por ejemplo `?page=`) o usen otra estrategia (§4). |
| Enlaces a fichas | `EquipoCard` → `/comprar?equipo={slug}` | Las fichas **no son rutas dedicadas** `/comprar/[slug]`: peor para snippets, compartir y **sitemap por producto**; alinear con §5 puntos 1–3 (URLs limpias + `generateMetadata` por equipo). |
| Datos estructurados | No | Con listado: opcional `ItemList` si las URLs públicas de ítems son estables. |

---

### `/comprar?equipo={slug}` — Detalle de equipo (misma ruta, query)

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| Título / descripción del documento | Siguen siendo los del **layout `/comprar`** | **Metadatos dinámicos** por equipo (marca, modelo, año, precio/consultar) con `generateMetadata` o ruta server: sin esto Google ve el mismo snippet para todas las fichas (§5 punto 3). |
| URL canónica | Query string | **Ruta dedicada** recomendada (ej. `/comprar/[slug]`) + `link rel="canonical"`; la query suele ser peor para indexación limpia y para redes. |
| Open Graph | Hereda genérico | `og:title`, `og:description`, **`og:image`** (foto principal del equipo) para WhatsApp/redes. |
| JSON-LD | No | `Product` + `Offer` (precio, moneda, `availability`) cuando los datos sean correctos (§4). |
| Contenido | `h1`, specs, descripción opcional, contacto | Valorar **FAQ** corta (financiación, inspección, entrega) y texto único por máquina (§5 puntos 1 y 4). |
| Migas | Correctas con título del equipo | Mantener; si pasáis a ruta `/comprar/[slug]`, actualizar enlaces. |

---

### `/vender` (`app/vender/page.tsx` → `VenderPage`)

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| Metadata propia | No hay `layout` ni `metadata` en la ruta | **Title + description** específicos (“Vender maquinaria usada”, proceso, confianza); OG/Twitter. |
| `h1` | “Vender” | Aceptable; opcional `h1` más descriptivo para búsqueda (“Vendé tu tractor o máquina vial”). |
| Contenido | Intro + formulario | Más **texto de confianza** (plazos, qué datos piden, zona): mejora intención informacional y E-E-A-T ligero (§5 punto 7). |
| JSON-LD | No | `WebPage` o `ContactPage` / formulario si queréis rich results limitados; no crítico. |

---

### `/nosotros` (`app/nosotros/page.tsx`)

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| Metadata propia | Hereda root | **Title + description** distintos a la home (“Quiénes somos”, historia, 30 años, rubro). |
| Estructura de encabezados | `h1` “Quiénes Somos”, `h2` secciones, `h3` tarjetas | Muy alineado a §4; mantener un solo `h1`. |
| Contenido | Buen texto narrativo + valores + servicios | Añadir **datos concretos de contacto o sede** en la página (no solo CTA a comprar) para coherencia con NAP y Local (§4). |
| JSON-LD | No | `AboutPage` + `Organization` enlazado es coherente con esta URL. |

---

### `/acceso` (ingresar / registrarse) (`app/acceso/page.tsx` → `AccesoClient`)

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| Metadata | Hereda root | Títulos del tipo “Ingresar \| Marcos Morici”; **robots: noindex, nofollow** (o al menos `noindex`) para no diluir el crawl en URLs de cuenta (§4 Sitio completo). |
| `h1` | “Ingresar o registrarse” | OK para accesibilidad. |
| Variantes `?tab=ingresar` / `?tab=registro` | Dos “caras” en una URL | **Canonical** a `/acceso` sin query o `noindex` en duplicados si generan problemas. |

---

### `/login` y `/registro`

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| Comportamiento | **Redirección 307/308** a `/acceso?tab=…` | Enlazar siempre a `/acceso` en sitemap y enlaces internos; estas rutas no deberían acumular señal SEO. |

---

### `/cuenta`, `/cuenta/perfil`, `/cuenta/mensajes`

| Elemento | Estado | Qué falta |
|----------|--------|-----------|
| `/cuenta` | Redirige a `/cuenta/perfil` | OK; no aporta contenido indexable. |
| Metadata | No específica | **`robots: noindex`** en layout `app/cuenta` para todo el árbol privado (§4). |
| `/cuenta/perfil` | `h1` “Tu perfil” | Contenido sensible / irrelevante para búsqueda: **noindex**. |
| `/cuenta/mensajes` | `h1` “Mensajes”, texto de “próximo paso” | **noindex**; evitar indexar páginas placeholder. |

---

### Resumen de prioridades tras la auditoría

1. **Home con contenido real + `h1`** (hoy crítico).  
2. **Rutas y metadatos de ficha** (`/comprar/[slug]` o equivalente + `generateMetadata` + OG image + JSON-LD `Product`).  
3. **`h1` y canonical en listado `/comprar`**; política frente a `?q=` y filtros.  
4. **Metadata + noindex** en `/acceso` y `/cuenta/**`.  
5. **Sitio: `sitemap`, `robots`, OG global, JSON-LD `Organization`, footer con NAP**.  
6. **Páginas informativas** (`/nosotros`, `/vender`): metadata única por ruta.

---

*Documento orientado al equipo del sitio Marcos Morici Tractores. Referencia analizada: home de [vialmaq.com.ar](https://vialmaq.com.ar/) (HTML público). Auditoría de rutas: código en `marcos-morici-tractores` (revisión estática, sin despliegue).*
