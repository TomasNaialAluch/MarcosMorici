# Guía de Construcción - Marcos Morici Tractores

## Descripción
Esta guía detalla paso a paso cómo construir la página web de Marcos Morici Tractores usando Next.js + Vercel, con enfoque en SEO y conversión a WhatsApp. La página está orientada a la venta de equipos usados y el objetivo principal es que los usuarios contacten por WhatsApp.

---

## FASE 1: Configuración Inicial del Proyecto

### Paso 1.1: Crear el proyecto Next.js
- Crear nuevo proyecto Next.js con TypeScript
- Configurar App Router (no Pages Router)
- Habilitar Tailwind CSS durante la instalación
- Configurar estructura de carpetas básica

### Paso 1.2: Configurar Firebase
- Instalar Firebase SDK
- Crear archivo de configuración de Firebase
- Configurar Firebase Storage para imágenes
- Configurar Firestore para base de datos
- Crear colecciones iniciales: `equipos`, `categorias`, `usuarios`

### Paso 1.3: Configurar variables de entorno
- Crear archivo `.env.local`
- Agregar credenciales de Firebase
- Agregar número de WhatsApp para contacto
- Configurar URL del sitio

### Paso 1.4: Configurar Tailwind con la paleta de colores
- Actualizar `tailwind.config.js` con los colores del logo
- Configurar fuentes (Inter, Roboto, o Bebas Neue para títulos)
- Crear archivo de variables CSS con la paleta completa

---

## FASE 2: Estructura Base y Layout

### Paso 2.1: Crear layout principal
- Crear componente `Header` con:
  - Barra superior azul oscura con logo
  - Barra de navegación con menú (COMPRAR, ALQUILAR, VENDER, NOSOTROS)
  - Barra de búsqueda en el header
- Crear componente `Footer` con:
  - Información de contacto
  - Enlaces de información
  - Sección de asesoramiento
  - Copyright
- Crear componente `WhatsAppButton` flotante (esquina inferior derecha)

### Paso 2.2: Crear página principal (Home)
- Implementar Hero Section con imagen de fondo y mensaje principal
- Crear sección de Call-to-Action Blocks (COMPRAR, ALQUILAR, VENDER)
- Implementar sección de productos destacados (carrusel)
- Agregar sección de Newsletter
- Asegurar que todo sea responsive

### Paso 2.3: Configurar rutas principales
- Crear página `/comprar` (listado de equipos en venta)
- Crear página `/alquilar` (listado de equipos en alquiler)
- Crear página `/vender` (formulario para vender equipo)
- Crear página `/nosotros` (información de la empresa)
- Crear página `/contacto` (formulario de contacto)

---

## FASE 3: Sistema de Productos (Equipos)

### Paso 3.1: Crear modelo de datos
- Definir estructura de datos para equipos:
  - Nombre del modelo
  - Marca
  - Año de fabricación
  - Horas de uso
  - Precio (si es venta)
  - Tipo (venta/alquiler)
  - Categoría
  - Descripción
  - Imágenes (múltiples)
  - Estado (activo/inactivo)
  - Fecha de creación

### Paso 3.2: Crear página de listado de productos
- Implementar página `/comprar` con:
  - Grid de tarjetas de productos
  - Filtros por categoría, marca, año, precio
  - Búsqueda de productos
  - Paginación o scroll infinito
  - Cada tarjeta debe mostrar: imagen, nombre, año, horas, precio, botón de acción

### Paso 3.3: Crear página de detalle de producto
- Crear ruta dinámica `/equipo/[slug]` o `/equipo/[id]`
- Implementar página con:
  - Galería de imágenes (múltiples fotos)
  - Información completa del equipo
  - Especificaciones técnicas
  - Botón principal: "CONSULTAR POR WHATSAPP"
  - El botón debe abrir WhatsApp con mensaje pre-rellenado incluyendo el nombre del equipo
  - Ejemplo de mensaje: "Hola, me interesa el equipo: [NOMBRE DEL EQUIPO]"

### Paso 3.4: Implementar funcionalidad de búsqueda
- Crear componente de búsqueda funcional
- Buscar por nombre, marca, categoría
- Mostrar resultados en tiempo real
- Crear página de resultados de búsqueda

---

## FASE 4: Panel de Administración

### Paso 4.1: Configurar autenticación
- Implementar login con Firebase Auth
- Crear página `/admin/login`
- Proteger rutas de admin con middleware
- Crear sistema de roles (admin solamente por ahora)

### Paso 4.2: Crear dashboard de administración
- Crear ruta `/admin` (protegida)
- Dashboard con:
  - Estadísticas básicas (total equipos, activos, etc.)
  - Accesos rápidos a secciones de admin
  - Lista de equipos recientes

### Paso 4.3: Gestión de categorías
- Crear página `/admin/categorias`
- Implementar CRUD de categorías:
  - Listar categorías existentes
  - Crear nueva categoría (nombre, descripción, imagen opcional)
  - Editar categoría
  - Eliminar categoría (con confirmación)
- Las categorías se usan para filtrar equipos

### Paso 4.4: Gestión de equipos
- Crear página `/admin/equipos`
- Listar todos los equipos con opciones de editar/eliminar
- Crear página `/admin/equipos/nuevo` con formulario completo:
  - Campos del formulario:
    - Nombre del modelo (obligatorio)
    - Marca (obligatorio)
    - Categoría (selector de categorías)
    - Año de fabricación
    - Horas de uso
    - Tipo (venta/alquiler)
    - Precio (si es venta)
    - Descripción
    - Subida de múltiples imágenes
    - Estado (activo/inactivo)
  - Validación de campos
  - Preview de imágenes antes de subir
  - Subir imágenes a Firebase Storage
  - Guardar datos en Firestore
- Crear página `/admin/equipos/[id]/editar` para editar equipos existentes
- Implementar eliminación de equipos (con confirmación)

### Paso 4.5: Gestión de imágenes
- Implementar subida de imágenes a Firebase Storage
- Permitir múltiples imágenes por equipo
- Opción de eliminar imágenes individuales
- Optimización de imágenes antes de subir (comprimir, redimensionar)
- Mostrar preview de imágenes seleccionadas

---

## FASE 5: Integración de WhatsApp

### Paso 5.1: Configurar botones de WhatsApp
- Crear componente reutilizable para botones de WhatsApp
- Configurar número de WhatsApp en variables de entorno
- Implementar función que genera URL de WhatsApp con mensaje pre-rellenado

### Paso 5.2: Botón en detalle de producto
- En la página de detalle del equipo, el botón "CONSULTAR POR WHATSAPP" debe:
  - Abrir WhatsApp Web o App
  - Incluir mensaje pre-rellenado con nombre del equipo
  - Ejemplo: "Hola, me interesa el equipo: CATERPILLAR 140H"
  - Incluir URL del producto para referencia

### Paso 5.3: Botón flotante de WhatsApp
- Mantener botón flotante en todas las páginas
- Mensaje genérico: "Hola, quiero más información"
- Posición fija en esquina inferior derecha
- Visible en todas las páginas excepto en admin

### Paso 5.4: Botones en tarjetas de productos
- En el listado, cada tarjeta debe tener botón "CONSULTAR" que lleva al detalle
- O botón directo de WhatsApp con nombre del equipo

---

## FASE 6: Optimización SEO

### Paso 6.1: Meta tags dinámicos
- Configurar metadata en cada página:
  - Título único y descriptivo
  - Descripción meta única
  - Open Graph tags para redes sociales
  - Twitter Cards
- En páginas de productos: incluir nombre del equipo en título y descripción

### Paso 6.2: URLs amigables
- Usar slugs para productos: `/equipo/caterpillar-140h-2024`
- URLs descriptivas y legibles
- Evitar IDs numéricos en URLs públicas

### Paso 6.3: Estructura semántica HTML
- Usar etiquetas semánticas correctas (header, nav, main, article, footer)
- Jerarquía correcta de H1, H2, H3
- Un solo H1 por página

### Paso 6.4: Schema.org markup
- Implementar Schema.org para productos
- Agregar Product schema en páginas de detalle
- Incluir: nombre, descripción, precio, imagen, marca, año
- Agregar Organization schema en footer
- Agregar BreadcrumbList schema

### Paso 6.5: Sitemap y robots.txt
- Generar sitemap.xml dinámicamente con todos los productos
- Incluir todas las páginas estáticas
- Configurar robots.txt correctamente
- Enviar sitemap a Google Search Console

### Paso 6.6: Optimización de imágenes
- Usar componente Image de Next.js para todas las imágenes
- Configurar lazy loading
- Usar formatos modernos (WebP, AVIF)
- Agregar alt text descriptivo a todas las imágenes

### Paso 6.7: Performance
- Implementar lazy loading de componentes pesados
- Optimizar carga de fuentes
- Minimizar JavaScript
- Configurar caching apropiado

---

## FASE 7: Funcionalidades Adicionales

### Paso 7.1: Página "Vender tu equipo"
- Crear formulario en `/vender`:
  - Datos del equipo a vender
  - Información de contacto
  - Subida de fotos
  - Enviar a Firebase (colección de solicitudes)
  - Notificación al admin

### Paso 7.2: Newsletter
- Implementar suscripción a newsletter
- Guardar emails en Firestore
- Validar formato de email
- Mensaje de confirmación

### Paso 7.3: Página "Nosotros"
- Crear página con información de la empresa
- Historia, valores, experiencia
- Imágenes representativas

### Paso 7.4: Página de contacto
- Formulario de contacto general
- Campos: nombre, email, teléfono, mensaje
- Enviar a Firebase y notificar al admin

---

## FASE 8: Responsive y UX

### Paso 8.1: Mobile First
- Asegurar que todo funcione bien en móvil
- Menú hamburguesa en móvil
- Tarjetas de productos adaptadas
- Formularios optimizados para móvil

### Paso 8.2: Testing en dispositivos
- Probar en diferentes tamaños de pantalla
- Probar en diferentes navegadores
- Verificar que WhatsApp funcione en móvil y desktop

### Paso 8.3: Accesibilidad
- Verificar contraste de colores
- Agregar alt text a imágenes
- Navegación por teclado funcional
- ARIA labels donde sea necesario

---

## FASE 9: Deploy y Configuración Final

### Paso 9.1: Configurar Vercel
- Conectar repositorio de GitHub con Vercel
- Configurar variables de entorno en Vercel
- Configurar dominio personalizado (si aplica)

### Paso 9.2: Configurar Firebase Hosting (opcional)
- Si prefieres Firebase Hosting en lugar de Vercel
- Configurar build y deploy

### Paso 9.3: Google Search Console
- Verificar propiedad del sitio
- Enviar sitemap
- Monitorear indexación

### Paso 9.4: Google Analytics
- Instalar Google Analytics 4
- Configurar eventos de conversión (clicks en WhatsApp)
- Monitorear tráfico y comportamiento

### Paso 9.5: Testing final
- Probar todas las funcionalidades en producción
- Verificar que WhatsApp funcione correctamente
- Verificar que admin funcione
- Probar en diferentes dispositivos

---

## FASE 10: Mantenimiento y Mejoras

### Paso 10.1: Documentación para el cliente
- Crear guía de uso del panel de administración
- Explicar cómo subir equipos
- Explicar cómo crear categorías
- Documentar proceso de edición

### Paso 10.2: Monitoreo
- Configurar alertas de errores (Sentry opcional)
- Monitorear performance
- Revisar analytics regularmente

### Paso 10.3: Mejoras futuras
- Sistema de favoritos
- Comparación de equipos
- Filtros avanzados
- Chat integrado (opcional)

---

## Checklist de Funcionalidades Críticas

### Frontend Público
- [ ] Home page con hero, CTAs y productos destacados
- [ ] Página de listado de productos con filtros
- [ ] Página de detalle de producto con galería
- [ ] Botón de WhatsApp en detalle con mensaje pre-rellenado
- [ ] Botón flotante de WhatsApp
- [ ] Búsqueda de productos
- [ ] Página "Vender tu equipo"
- [ ] Página "Nosotros"
- [ ] Página "Contacto"
- [ ] Newsletter
- [ ] Footer completo
- [ ] Responsive en todos los dispositivos

### Panel de Administración
- [ ] Login de administrador
- [ ] Dashboard con estadísticas
- [ ] CRUD de categorías
- [ ] CRUD de equipos
- [ ] Subida de múltiples imágenes
- [ ] Edición de equipos existentes
- [ ] Eliminación de equipos
- [ ] Gestión de estado (activo/inactivo)

### SEO y Performance
- [ ] Meta tags dinámicos en todas las páginas
- [ ] Schema.org markup para productos
- [ ] Sitemap.xml generado dinámicamente
- [ ] Robots.txt configurado
- [ ] URLs amigables
- [ ] Imágenes optimizadas
- [ ] Performance score > 90

### Integración WhatsApp
- [ ] Botón en detalle con nombre del equipo
- [ ] Botón flotante funcional
- [ ] Mensajes pre-rellenados correctos
- [ ] Funciona en móvil y desktop

### Deploy
- [ ] Proyecto deployado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado (si aplica)
- [ ] Google Search Console configurado
- [ ] Google Analytics configurado

---

## Notas Importantes

1. **Enfoque en WhatsApp**: Todos los CTAs deben llevar a WhatsApp, no a carrito de compras
2. **Mensajes pre-rellenados**: Siempre incluir el nombre del equipo en el mensaje de WhatsApp
3. **SEO es crítico**: Cada producto debe tener su propia página con meta tags únicos
4. **Admin simple**: El panel de admin debe ser intuitivo para que el cliente pueda usarlo fácilmente
5. **Imágenes**: Optimizar todas las imágenes antes de subir, usar formatos modernos
6. **Performance**: La página debe cargar rápido, especialmente en móvil
7. **Responsive**: Todo debe verse y funcionar bien en móvil, tablet y desktop

---

## Orden de Implementación Recomendado

1. **Semana 1**: Fases 1 y 2 (Configuración y estructura base)
2. **Semana 2**: Fase 3 (Sistema de productos)
3. **Semana 3**: Fase 4 (Panel de administración)
4. **Semana 4**: Fases 5 y 6 (WhatsApp y SEO)
5. **Semana 5**: Fases 7, 8 y 9 (Funcionalidades adicionales, responsive y deploy)
6. **Semana 6**: Testing, ajustes y documentación

---

## Recursos Necesarios

- Cuenta de Firebase (ya tienes)
- Cuenta de Vercel (gratis)
- Número de WhatsApp Business
- Logo en formato SVG o PNG de alta calidad
- Imágenes de productos para comenzar
- Textos de la empresa (historia, valores, etc.)

---

Esta guía te llevará paso a paso en la construcción de la página. Cada fase se puede desarrollar de forma independiente, pero es recomendable seguir el orden sugerido para evitar dependencias faltantes.
