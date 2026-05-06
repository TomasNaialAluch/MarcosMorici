# Página «Quiero vender» (Vialmaq) — Análisis técnico y de producto

**URL de referencia:** [vialmaq.com.ar/quiero-vender](https://vialmaq.com.ar/quiero-vender)

**Proyecto Marcos Morici:** ruta prevista `/vender` (hoy placeholder en `app/vender/page.tsx`). Este documento describe **solo el comportamiento observado en Vialmaq** a partir del HTML público y la configuración del formulario incrustada en la página (mayo 2026), para servir de especificación al implementar el flujo de venta.

Complementa [`README_VIALMAQ_ANALISIS.md`](./README_VIALMAQ_ANALISIS.md) y [`README_COMPRAR_VIALMAQ.md`](./README_COMPRAR_VIALMAQ.md) (catálogo de compra).

---

## 1. Resumen ejecutivo

La página **no es un wizard de Magento Checkout** ni un alta de producto en el catálogo: es una **página CMS** (`cms-quiero-vender`) con **layout de una columna**, cuyo contenido principal es un **formulario construido con Amasty Custom Form** (identificador interno **form_id = 6**). El envío va por **POST multipart** al endpoint propio del módulo Amasty; el front renderiza campos y **pasos** con JavaScript (`formRender`, `form-init`, validación Magento `validation`). Hay **campos condicionales** según tipo de maquinaria, condición nueva/usado y adjuntos opcionales.

En una frase: **captación de leads de consignación/venta** con datos de la máquina, archivos y contacto, en **dos etapas tituladas** («Sobre la máquina» / «Datos de contacto»), botón **Enviar**, y el resto del sitio (header, footer, WhatsApp, tracking) igual que en el resto del storefront.

---

## 2. Contexto de plataforma (Magento + tema)

| Señal en el HTML | Interpretación |
|------------------|----------------|
| `class="... cms-quiero-vender cms-page-view page-layout-1column"` | Página **CMS** estándar, **una columna** (sin sidebar de facetas). |
| `Amasty_Customform` (CSS/JS) | Formulario dinámico **Amasty Custom Form**. |
| `action=".../amasty_customform/form/submit/"` | Backend del módulo recibe el POST. |
| `jquery/uppy/.../uppy-custom.css` | **Uppy** disponible en el tema (subida de archivos moderna; Amasty suele integrar o coexistir con uploads). |
| `Magento_PageBuilder` | El bloque donde vive el form puede haberse editado con **Page Builder** (HTML embebido + script de render). |
| `Amasty_InvisibleCaptcha`, `am-recaptcha` | **Protección anti-spam** (reCAPTCHA invisible / configuración Amasty). |
| `Smile_ElasticsuiteTracker`, GTM, Facebook Pixel | **Analytics** y remarketing como en el resto del sitio. |

La tienda usa tema **Rollpix / mundovial** (`frontend/Rollpix/mundovial/es_AR`), coherente con [vialmaq.com.ar](https://vialmaq.com.ar/).

---

## 3. Armazón de la pantalla (shell de página)

### 3.1 Cabecera global

Igual que en catálogo y otras páginas: logo, menú (Comprar, Alquilar, Vender, Nosotros), búsqueda, cuenta, carrito, wishlist. **No aporta lógica específica** al formulario de vender salvo navegación y posible estado de sesión de cliente.

### 3.2 Migas de pan (breadcrumb)

- Estructura: **Inicio** (enlace al home) → **Quiero vender** (ítem actual en `<strong>`, sin enlace).
- Clases típicas Magento: `div.breadcrumbs` > `ul.items` > `li.item`.

### 3.3 Zona de mensajes

Debajo del breadcrumb, bloque `page messages` con **Knockout** (`data-bind`) para mensajes flash (éxito/error tras envío, avisos de sesión, etc.). Patrón estándar Magento 2.

### 3.4 Contenido principal (`main#maincontent` → `div.column.main`)

Aquí se inyecta el **widget HTML** de Page Builder / CMS que contiene:

1. El `<form>` con clase `rendered-form amform-form default` e `id="amform-form-6"`.
2. Campos ocultos Magento: **`form_key`** (CSRF), **`form_id`** = `6`, **`is_survey`** = `0`.
3. Un contenedor vacío `.insert-container.fields` que **RequireJS** rellena al ejecutar `formRender` con el JSON del formulario.

### 3.5 Pie de página

Mismo footer corporativo: columnas con teléfono, email, enlaces INFO, bloque de asesoramiento y WhatsApp, copyright. No forma parte del flujo de envío del formulario.

### 3.6 WhatsApp flotante

Imagen/widget de chat (extensión **Wbcom_Whatsapp** en assets del tema), coherente con el resto del sitio.

---

## 4. Formulario Amasty — contrato técnico

### 4.1 Identificación

| Atributo | Valor |
|----------|--------|
| `id` del formulario (DOM) | `amform-form-6` |
| `data-amform-id` | `6` |
| Campo oculto `form_id` | `6` |
| Acción POST | `https://vialmaq.com.ar/amasty_customform/form/submit/` |
| Método | `POST` |
| `enctype` | `multipart/form-data` (obligatorio por **archivos**) |
| Validación cliente | `data-mage-init='{"validation": {...}}'` (Magento + reglas Amasty; ignora campos ocultos por multipágina). |

### 4.2 Renderizado y multipágina

- Tras cargar la página, `require([...])` ejecuta **`renderForm()`**, que llama a `renderedFormContainer.formRender(6, config, ...)` sobre `#amform-form-6 .insert-container`.
- La configuración incluye:
  - **`formData`**: JSON serializado con **dos páginas** de campos (arrays anidados).
  - **`pageTitles`**: `["Sobre la máquina", "Datos de contacto"]` (títulos de paso en UI).
  - **`submitButtonTitle`**: `Enviar`.
  - **`ajax_submit`**: `0` en la captura analizada → el envío puede ser **POST clásico** (recarga o redirección según respuesta del servidor), no AJAX obligatorio.
  - **`urlSession`**: endpoint `.../amasty_customform/form/sessiondata/` para **datos de sesión** / multipágina (Amasty suele guardar progreso o estado entre pasos).
- Eventos **`amcform-init-multipage`** y componente **`[data-amcform-js="multi-page"]`** inicializan el wizard multipaso y **`amFormFill`** con `formParams` (`formId`, `productId`).

### 4.3 Estilos locales en la página

Bloque `<style>` inline sobre `.amform-form`:

- Botón principal **Enviar**: fondo y borde **#FFD000** (amarillo Vialmaq), texto **#000**; en hover fondo/borde **#666**, texto **#fff**.
- Etiquetas `.label`: `font-size: 13px`, `margin-bottom: 3px`.
- Pasos `.amcform-step`: margen inferior para separación visual.

### 4.4 Dependencias cargadas (RequireJS)

Además de `jquery`, el formulario pide módulos **Amasty_Customform**: `google-map-loader`, `form-render`, `form-filler`, `am-google-map`, `form-init`. Eso habilita **mapas / geolocalización** en el ecosistema Amasty (puede usarse en otros formularios o quedar disponible para el campo de ubicación textual).

---

## 5. Flujo de usuario (producto)

1. El usuario llega desde el menú **Vender** o enlaces internos a **Quiero vender**.
2. Ve el formulario en **primer paso**: datos de la máquina; algunos campos **aparecen u ocultan** según selección (tipo, condición, tipo implica peso o balde).
3. Avanza al **segundo paso**: datos de contacto y mensaje opcional.
4. Pulsa **Enviar**; el servidor Amasty/Magento procesa, aplica **captcha** si está activo, guarda adjuntos y devuelve mensaje (éxito/error) vía flujo estándar de Magento.

**Objetivo de negocio:** que Vialmaq reciba una **solicitud estructurada** para evaluar la máquina (no publicación automática en catálogo desde este formulario, salvo proceso manual interno).

---

## 6. Inventario exhaustivo de campos

Los nombres internos (`dropdown-1718122367974`, etc.) son **IDs de Amasty**; las **etiquetas** son las que ve el usuario.

### 6.1 Paso 1 — «Sobre la máquina»

| # | Tipo | Etiqueta | Obligatorio | Notas / dependencias |
|---|------|----------|:-------------:|----------------------|
| 1 | Desplegable | **Tipo de maquinaria** | Sí | Opciones: **Retroexcavadoras**, **Equipos de compactación**, **Motoniveladoras**, **Cargadoras**, **Minicargadoras**, **Topadoras**, **Miniexcavadoras**, **Otros**. Valor por defecto en JSON: *Retroexcavadoras*. |
| 2 | Texto | **Indique el tipo de maquinaria** | Sí *condicional* | Visible y requerido solo si en (1) se elige **Otros** (`dependencyValue`: `otros`). |
| 3 | Radio | **Condición** | Sí | **Nuevo** / **Usado** (default en JSON: *Nuevo*). |
| 4 | Número | **Horas de uso (hs)** | Sí *condicional* | Visible y requerido si **Condición** = **Usado**. |
| 5 | Texto | **Marca** | Sí | Layout «two» (mitad de ancho en grid Amasty). |
| 6 | Texto | **Modelo** | Sí | Layout «two». |
| 7 | Número | **Año de fabricación** | Sí | Sin dependencias. |
| 8 | Texto | **Precio** | Sí | Layout «two» (texto libre, no solo numérico en el tipo de campo). |
| 9 | Desplegable | **Moneda** | Sí | **Peso argentino** / **Dólar** (default: *Peso argentino*). |
| 10 | Número | **Peso total (Kg)** | Sí *condicional* | Se exige cuando **Tipo de maquinaria** es **Retroexcavadoras** *o* **Miniexcavadoras** (en el JSON aparecen **dos reglas** de dependencia sobre el mismo desplegable, interpretación típica OR). |
| 11 | Número | **Capacidad de balde (m³)** | Sí *condicional* | Solo cuando el tipo es **Cargadoras**. |
| 12 | Área de texto | **Descripción de la máquina** | No | Sin `required` en `validation_fields`. |
| 13 | Archivo | **Folleto de la máquina en PDF** | No | Extensiones permitidas (lista del servidor): `doc, docx, xls, xlsx, ppt, pptx, gif, bmp, png, jpg, jpeg, pdf, txt`. |
| 14 | Archivo | **Imágenes** | No | Misma lista de extensiones (el nombre sugiere fotos; el validador admite también ofimática e imágenes). |

**Coherencia con el catálogo de compra:** los mismos conceptos de **peso total (kg)**, **capacidad de balde (m³)** y **horas** aparecen en filtros del listado [quiero-comprar](https://vialmaq.com.ar/quiero-comprar); aquí se **piden solo cuando el tipo de máquina lo justifica**, reduciendo ruido para el usuario.

### 6.2 Paso 2 — «Datos de contacto»

| # | Tipo | Etiqueta | Obligatorio | Notas |
|---|------|----------|:-------------:|-------|
| 1 | Texto | **Nombre y apellido** | Sí | — |
| 2 | Texto | **Correo electrónico** | Sí | Validación Magento **`validate-email`**. |
| 3 | Texto | **Celular** | Sí | — |
| 4 | Texto | **Ubicación geográfica de la máquina** | Sí | Texto libre (provincia/ciudad/dirección aproximada según lo que escriba el usuario). |
| 5 | Área de texto | **Si desea puede agregar un mensaje adicional** | No | Opcional. |

---

## 7. Lógica condicional (diagrama mental)

```text
[Tipo de maquinaria]
    └─ "Otros" → muestra [Indique el tipo de maquinaria] (requerido)
    └─ "Retroexcavadoras" o "Miniexcavadoras" → muestra [Peso total (Kg)] (requerido)
    └─ "Cargadoras" → muestra [Capacidad de balde m³] (requerido)

[Condición]
    └─ "Usado" → muestra [Horas de uso] (requerido)
    └─ "Nuevo" → oculta horas (no aplica en JSON)
```

Los demás campos del paso 1 son **siempre visibles** en la definición analizada (salvo que Amasty oculte por layout responsive); **Marca, Modelo, Año, Precio, Moneda** no tienen `dependency` en el JSON.

---

## 8. Seguridad, privacidad y calidad de datos

- **`form_key`**: token anti-CSRF estándar Magento en POST.
- **Captcha invisible** (config Amasty en la página): reduce spam en formularios públicos.
- **Archivos**: `multipart/form-data`; límites reales de tamaño y virus scan dependen de la **configuración del servidor** y del módulo (no expuestos en el fragmento HTML revisado).
- **Datos personales**: nombre, email, teléfono y ubicación del equipo; deben alinearse con **política de privacidad** y **Términos** del sitio (enlace en footer).
- **Email** con validación de formato; **precio** como texto permite rangos o aclaraciones pero dificulta validación numérica estricta en cliente.

---

## 9. Integraciones periféricas (no exclusivas de «Vender»)

- **Google Tag Manager** (`GTM-56SKBBQX`) y **Facebook Pixel** (Amasty / fbq): eventos de página y posiblemente de conversión si se configuró el envío del formulario como objetivo.
- **Cookie banner / cumplimiento**: mensaje «The store will not work correctly when cookies are disabled» en plantilla Magento.
- **Customer section** / login: popup de autenticación presente en DOM (típico global); el formulario de vender **no exige login** en el HTML analizado (formulario accesible como guest salvo reglas de Magento no visibles en el snippet).

---

## 10. Relación con Marcos Morici Tractores

| Aspecto | Vialmaq (referencia) | Estado / recomendación en Marcos Morici |
|---------|----------------------|----------------------------------------|
| Ruta | `/quiero-vender` (CMS) | `/vender` — [README_VIALMAQ_ANALISIS.md](./README_VIALMAQ_ANALISIS.md) |
| Implementación | Amasty Custom Form + Magento | Equivalente posible: **Formulario React** + **Cloud Function** o **Resend/SendGrid** + almacenamiento en **Firestore** como «lead» o borrador de equipo |
| Multipaso | Dos pasos con títulos explícitos | Recomendable para móvil y para separar **máquina** vs **contacto** |
| Condicionales | Otros → texto; Usado → horas; tipo → peso/balde | Replicar con `react-hook-form` + `watch()` o estado equivalente |
| Archivos | PDF + imágenes opcionales | **Firebase Storage** con reglas estrictas + tipos MIME |
| Moneda | ARS / USD | Alinear con catálogo (USD predominante en cards de compra) |
| Spam | reCAPTCHA Amasty | **Turnstile / reCAPTCHA v3** + rate limit en backend |
| Identidad visual | Botón amarillo #FFD000 | Usar paleta propia: CTAs **navy / naranja** — [`README_PALETA_COLORES.md`](../../README_PALETA_COLORES.md) (carpeta `docs/`) |

La página actual **`app/vender/page.tsx`** solo muestra breadcrumb y «Página en construcción»; este README puede usarse como **checklist funcional** al implementarla.

---

## 11. Fuentes y limitaciones del análisis

- **Fuente principal:** HTML público de [vialmaq.com.ar/quiero-vender](https://vialmaq.com.ar/quiero-vender) descargado con `curl` (mayo 2026), incluyendo el JSON embebido en `formRender` y marcas de clases Magento/Amasty.
- **Limitaciones:** no se observó la **respuesta HTTP tras envío** ni el **back-office** Amasty (emails destino, auto-respuesta, adjuntos en disco). Los textos de ayuda bajo cada label, si existen, pueden estar en el render JS y no en el HTML inicial. Si Vialmaq actualiza el **form_id** o el JSON del formulario, las tablas de las §6 deberían **revalidarse** contra el HTML nuevo.

---

## 12. Referencias en el código (Marcos Morici)

| Pieza | Archivo |
|-------|---------|
| Ruta `/vender` | `app/vender/page.tsx` |
| Página (layout + copy) | `components/vender/VenderPage.tsx` |
| Wizard, envío y éxito | `components/vender/VenderLeadForm.tsx` |
| Tabs de pasos | `components/vender/VenderWizardShell.tsx` |
| Paso máquina / contacto | `components/vender/steps/VenderStepMachine.tsx`, `VenderStepContact.tsx` |
| Campos reutilizables | `components/vender/fields/*` |
| Estado y validación UI | `components/vender/hooks/useVenderLeadForm.ts` |
| Tipos del lead | `lib/types/venderLead.ts` |
| Constantes y visibilidad | `lib/vender/constants.ts`, `fieldVisibility.ts`, `initialState.ts` |
| Validación y WhatsApp | `lib/vender/validators.ts`, `buildLeadWhatsappMessage.ts` |
| Persistencia Firestore/Storage | `lib/firebase/venderLeads.ts` |
| Enlace «Vender» en cabecera | `components/Header.tsx` |
| Enlace desde catálogo vacío | `components/comprar/CatalogoEquiposList.tsx` |

**Firestore:** colección `venderLeads` y prefijo de Storage `vender_leads/{uuid}/`. Configurá reglas de escritura acorde (solo staff, o anónimo acotado, según política del negocio).

---

## 13. Referencias cruzadas

- [`README_VIALMAQ_ANALISIS.md`](./README_VIALMAQ_ANALISIS.md) — mapa de secciones y rutas.
- [`README_COMPRAR_VIALMAQ.md`](./README_COMPRAR_VIALMAQ.md) — listado y facetas alineadas conceptualmente con peso, balde y horas.
- [`README_ENV.md`](./README_ENV.md) — variables de entorno (útil cuando exista backend de formulario).

---

*Documento generado a partir del análisis del HTML público de la página «Quiero vender» de Vialmaq. Las URLs internas (`/amasty_customform/...`) pertenecen a su instalación Magento.*
