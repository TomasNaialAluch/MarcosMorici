# Guía de Assets - Marcos Morici Tractores

## Estructura de Carpetas

### `/public/logo/`
Coloca aquí los archivos del logo:
- **logo.svg** o **logo.png** - Logo estático (fallback si no hay video)
- **logo-animado.mp4** - Video animado del logo para la pantalla de carga
- **favicon.ico** - Icono que aparece en la pestaña del navegador

### `/public/images/`
Coloca aquí todas las imágenes del sitio:
- Imágenes de equipos/tractores
- Imágenes del hero section
- Imágenes de la página "Nosotros"
- Cualquier otra imagen del sitio

### `/public/videos/`
Coloca aquí videos adicionales (si los hay):
- Videos promocionales
- Videos de equipos en funcionamiento
- Cualquier otro video del sitio

## Formato del Video de Carga

El video del logo debe:
- Formato: MP4
- Duración recomendada: 2-5 segundos
- Fondo: Blanco o transparente
- Tamaño recomendado: 512x512px o 1024x1024px (cuadrado)
- Peso: Optimizado (máximo 2-3MB)

## Cómo Funciona el Loader

1. Al cargar la página, se muestra el video del logo animado
2. Si no hay video, se muestra la imagen estática del logo
3. Si no hay ni video ni imagen, se muestra un spinner
4. Después de 2 segundos mínimo, el loader hace fade out
5. El loader desaparece y se muestra el contenido principal

## Notas

- El loader solo se muestra en la primera carga de la página
- El fondo siempre es blanco para mantener consistencia con el logo
- El video se reproduce automáticamente, sin sonido, y en loop si es necesario
