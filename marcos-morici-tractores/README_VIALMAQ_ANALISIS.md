# Análisis de estructura – Vialmaq (referencia)

Sitio de referencia: [vialmaq.com.ar](https://vialmaq.com.ar/)

Este documento analiza la estructura de Vialmaq para guiar el desarrollo de Marcos Morici Tractores. **No implementaremos alquileres**, solo venta de equipos.

---

## 1. Navegación principal

| Sección   | Descripción                          | ¿Implementar? |
|----------|--------------------------------------|---------------|
| Comprar  | Catálogo de equipos en venta         | ✅ Sí         |
| Alquilar | Catálogo de equipos en alquiler      | ❌ No         |
| Vender   | Formulario/publicación para vender   | ✅ Sí         |
| Nosotros | Página institucional                 | ✅ Sí         |
| Buscador | Búsqueda de equipos                  | ✅ Sí (ya existe) |

**Nota:** La finalidad es que el usuario contacte por WhatsApp a los administradores. No hay carrito ni checkout.

---

## 2. Secciones de la home

1. **Hero** – Mensaje principal: "Te ofrecemos soluciones que están a tu alcance"
2. **Grid de equipos** – Cards con equipos destacados (venta y/o alquiler)
3. **Newsletter** – Suscripción por email
4. **Footer** – Contacto, info, asesoramiento, WhatsApp

---

## 3. Estructura de una card de equipo

- Imagen principal
- Marca y modelo (ej. BOBCAT S-530 cc, CATERPILLAR 316GC)
- Tipo: **Venta** o Alquiler *(solo Venta para nosotros)*
- Año y horas de uso (si aplica)
- Precio (US$ o "Consultar valor")
- Botón **Comprar**
- Botón "Añadir para comparar" *(opcional)*

---

## 4. Footer (Vialmaq)

- **Columna 1:** Marca, teléfono, email
- **Columna 2:** INFO – Nosotros, Contacto, Términos y Condiciones
- **Columna 3:** Asesoramiento + teléfono
- Copyright
- Chat de WhatsApp (FAB)

---

## 5. Adaptación para Marcos Morici Tractores

| Vialmaq                    | Marcos Morici              |
|----------------------------|----------------------------|
| Comprar, Alquilar, Vender, Nosotros | Comprar, Vender, Nosotros |
| Grid con venta y alquiler   | Solo venta                 |
| Carrito / Checkout         | No – contacto vía WhatsApp |
| Newsletter                  | A definir                  |
| Comparador de equipos       | A definir                  |

---

## 6. Rutas sugeridas

| Ruta              | Descripción                          |
|-------------------|--------------------------------------|
| `/`               | Home con grid de equipos destacados  |
| `/comprar`        | Catálogo con filtros y búsqueda      |
| `/comprar/[slug]` | Detalle de equipo                    |
| `/vender`         | Formulario para publicar venta       |
| `/nosotros`       | Quiénes somos                        |

---

## 7. Funcionalidades a priorizar

1. **Catálogo de equipos** – Datos en Firestore
2. **Búsqueda** – ExpandableSearch ya implementado
3. **Detalle de equipo** – Página individual con botón WhatsApp
4. **Formulario de venta** – Alta de equipos (admin o público)
5. **Filtros** – Marca, año, precio, tipo de equipo

---

## 8. Modelo de datos sugerido (equipo)

```ts
interface Equipo {
  id: string;
  titulo: string;        // ej. "CATERPILLAR 316GC"
  marca: string;
  modelo: string;
  ano?: number;
  horas?: number;
  precio?: number;       // en USD
  precioConsultar?: boolean;
  descripcion?: string;
  imagenes: string[];    // URLs de Storage
  createdAt: Date;
  publicado: boolean;
}
```
