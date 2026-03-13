# Home - Estado Estetico Base

## Objetivo visual actual

Secuencia inicial limpia y controlada:

1. Entra usuario a la web.
2. Se reproduce el video de carga sobre fondo blanco.
3. Termina loader y queda pagina blanca.
4. Arranca animacion del navbar:
   - aparece barra azul,
   - cae el logo centrado,
   - logo se mueve con rebote suave hasta la izquierda,
   - aparecen links desde la izquierda.

No hay contenido extra en Home todavia (solo fondo blanco).
No hay Footer ni FAB en esta etapa base.

---

## Timing actual

- Loader visible: `7000ms`
- Fade out loader: `500ms`
- Inicio animacion navbar: `7600ms`
- Navbar queda estable: `9800ms`

---

## Archivos clave

- `components/Loader.tsx`
- `components/Header.tsx`
- `components/Header.css`
- `app/layout.tsx`
- `app/page.tsx`

---

## Criterios de aceptacion de esta etapa

- Al refrescar:
  - se ve primero el video del loader.
  - no se ve contenido del home durante el loader.
  - luego se ve fondo blanco.
  - despues se ejecuta la animacion del navbar.
- El logo termina posicionado a la izquierda.
- Los links terminan visibles y estables.

---

## Nota para siguientes pasos

Cuando aprobemos esta base visual, continuamos con:

1. Hero Section
2. Bloques CTA
3. Buscador refinado
4. Reintegracion de Footer y FAB con timing final

