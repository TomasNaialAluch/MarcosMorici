# Instrucciones de Inicio - Marcos Morici Tractores

## ✅ Lo que ya está configurado

1. **Proyecto Next.js** creado con TypeScript y Tailwind CSS
2. **Paleta de colores** configurada según los logos
3. **Estructura de carpetas** para assets:
   - `/public/logo/` - Para logos y video animado
   - `/public/images/` - Para imágenes del sitio
   - `/public/videos/` - Para videos adicionales
4. **Componente Loader** creado con soporte para video animado del logo
5. **Layout principal** configurado con metadata SEO básica

## 📁 Dónde colocar los archivos

### Logo y Video de Carga
Coloca estos archivos en `/public/logo/`:
- `logo-animado.mp4` - Video del logo para la pantalla de carga
- `logo.svg` o `logo.png` - Logo estático (fallback)
- `favicon.ico` - Icono del navegador

### Imágenes
Coloca todas las imágenes en `/public/images/`

### Videos
Coloca videos adicionales en `/public/videos/`

## 🚀 Cómo iniciar el proyecto

1. Abre una terminal en la carpeta del proyecto:
   ```bash
   cd marcos-morici-tractores
   ```

2. Instala las dependencias (si no se instalaron automáticamente):
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en: `http://localhost:3000`

## 📝 Próximos pasos

1. **Agregar los assets del logo:**
   - Coloca `logo-animado.mp4` en `/public/logo/`
   - Coloca `logo.svg` o `logo.png` en `/public/logo/`

2. **Configurar Firebase:**
   - Crear archivo `.env.local` con las credenciales
   - Instalar Firebase SDK: `npm install firebase`

3. **Crear componentes base:**
   - Header
   - Footer
   - Navegación
   - Botón de WhatsApp

4. **Crear páginas principales:**
   - Home completa
   - Página de productos
   - Página de detalle
   - Panel de administración

## 🔧 Comandos útiles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run start` - Inicia servidor de producción
- `npm run lint` - Ejecuta el linter

## 📚 Documentación

- Ver `README_GUIA_CONSTRUCCION.md` para la guía completa de desarrollo
- Ver `README_ASSETS.md` para detalles sobre los assets
- Ver `README_PALETA_COLORES.md` para la paleta de colores
- Ver `README_UX_UI.md` para la guía de diseño
