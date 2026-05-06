/** Valores derivados del ancho de pantalla para la barra de categorías (gap + miniaturas + texto). */
export type CategoriaBarLayout = {
  gapPx: number;
  thumbW: number;
  thumbH: number;
  colWidthPx: number;
  iconSize: number;
  labelFontPx: number;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Interpola entre móvil angosto (~320px) y escritorio ancho (~1440px).
 * Extremos altos un poco más generosos (miniaturas + gap) en PC ancho.
 */
export function categoriaBarLayoutFromWidth(viewportWidth: number): CategoriaBarLayout {
  const t = clamp((viewportWidth - 320) / (1440 - 320), 0, 1);
  return {
    gapPx: Math.round(8 + t * 18),
    thumbW: Math.round(36 + t * 20),
    thumbH: Math.round(30 + t * 16),
    colWidthPx: Math.round(72 + t * 36),
    iconSize: Math.round(19 + t * 11),
    labelFontPx: Math.round(7 + t * 2.25),
  };
}
