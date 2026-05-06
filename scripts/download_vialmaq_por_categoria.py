#!/usr/bin/env python3
"""
Descarga 1 equipo por categoría de compra en vialmaq.com.ar (máx. 10 categorías).
Guarda: imagen principal, PDF si existe, datos.txt por carpeta.
"""
from __future__ import annotations

import html as html_lib
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://www.vialmaq.com.ar"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Slug de categoría bajo /quiero-comprar/ y nombre legible
CATEGORIAS: list[tuple[str, str]] = [
    ("retroexcavadoras", "Excavadoras"),
    ("miniexcavadoras", "Retropalas"),
    ("cargadoras", "Cargadoras"),
    ("minicargadoras", "Minicargadoras"),
    ("equipos-de-compactacion", "Compactación"),
    ("motoniveladoras", "Motoniveladoras"),
    ("topadoras", "Topadoras"),
    ("otros", "Otros"),
]

MAX_MAQUINAS = 10

# Si la subcategoría no tiene listados (Magento vacío), usar slug de producto público.
FALLBACK_PRODUCT_SLUG: dict[str, str] = {
    # Mayo 2026: /quiero-comprar/minicargadoras devuelve «sin productos»; ejemplo en home.
    "minicargadoras": "bob-cat-s-530-cc-3",
}

# Primer producto con href absoluto en la tarjeta (no plantillas KO)
PRODUCT_HREF_RE = re.compile(
    r'href="(https://(?:www\.)?vialmaq\.com\.ar/([a-z0-9-]+))"\s[^>]*class="product photo product-item-photo"',
    re.I,
)
OG_IMAGE_RE = re.compile(
    r'<meta\s+property="og:image"\s+content="([^"]+)"',
    re.I,
)
OG_TITLE_RE = re.compile(
    r'<meta\s+property="og:title"\s+content="([^"]+)"',
    re.I,
)
OG_DESC_RE = re.compile(
    r'<meta\s+property="og:description"\s+content="([^"]+)"',
    re.I,
)
OG_URL_RE = re.compile(
    r'<meta\s+property="og:url"\s+content="([^"]+)"',
    re.I,
)
PRICE_RE = re.compile(
    r'<meta\s+property="product:price:amount"\s+content="([^"]+)"',
    re.I,
)
CURRENCY_RE = re.compile(
    r'<meta\s+property="product:price:currency"\s+content="([^"]+)"',
    re.I,
)
SKU_RE = re.compile(
    r'<div\s+class="value"\s+itemprop="sku">([^<]+)</div>',
    re.I,
)
PDF_RE = re.compile(
    r'href="(https://(?:www\.)?vialmaq\.com\.ar/media/catalog/product/attachment/[^"]+\.pdf)"',
    re.I,
)
TABLE_ROW_RE = re.compile(
    r'<th[^>]*class="col label"[^>]*>([^<]+)</th>\s*<td[^>]*class="col data"[^>]*>([^<]*)</td>',
    re.I | re.S,
)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read()
    return raw.decode("utf-8", errors="replace")


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def unescape_meta(s: str) -> str:
    s = html_lib.unescape(s)
    s = s.replace("&#x20;", " ").replace("&#xA0;", " ")
    return s.strip()


def safe_folder_name(name: str) -> str:
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    return name[:120] or "equipo"


def main() -> int:
    out_root = Path(__file__).resolve().parent.parent / "vialmaq_muestras_por_categoria"
    out_root.mkdir(parents=True, exist_ok=True)

    count = 0
    for cat_slug, cat_label in CATEGORIAS:
        if count >= MAX_MAQUINAS:
            break
        cat_url = f"{BASE}/quiero-comprar/{cat_slug}"
        try:
            cat_html = fetch(cat_url)
        except urllib.error.HTTPError as e:
            print(f"[ERROR] {cat_url}: HTTP {e.code}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[ERROR] {cat_url}: {e}", file=sys.stderr)
            continue

        m = PRODUCT_HREF_RE.search(cat_html)
        used_fallback = False
        if not m:
            fb = FALLBACK_PRODUCT_SLUG.get(cat_slug)
            if fb:
                product_url = f"{BASE}/{fb}"
                product_slug = fb
                used_fallback = True
                print(f"[AVISO] {cat_label}: listado vacío, uso fallback {product_slug}", file=sys.stderr)
            else:
                print(f"[AVISO] Sin producto en categoría {cat_label} ({cat_url})", file=sys.stderr)
                continue
        else:
            product_url = m.group(1).replace("://vialmaq.com.ar/", "://www.vialmaq.com.ar/")
            product_slug = m.group(2)

        try:
            phtml = fetch(product_url)
        except Exception as e:
            print(f"[ERROR] producto {product_url}: {e}", file=sys.stderr)
            continue

        folder = out_root / safe_folder_name(product_slug)
        folder.mkdir(parents=True, exist_ok=True)

        og_img = OG_IMAGE_RE.search(phtml)
        og_title = OG_TITLE_RE.search(phtml)
        og_desc = OG_DESC_RE.search(phtml)
        og_url = OG_URL_RE.search(phtml)
        price = PRICE_RE.search(phtml)
        currency = CURRENCY_RE.search(phtml)
        sku_m = SKU_RE.search(phtml)
        pdf_m = PDF_RE.search(phtml)

        lines: list[str] = []
        if used_fallback:
            lines.append(
                "NOTA: La subcategoría en Vialmaq no tenía productos en listado; "
                "se usó un equipo de referencia (misma familia / visible en catálogo general)."
            )
            lines.append("")
        lines.append(f"Categoría (barra Comprar): {cat_label}")
        lines.append(f"URL categoría: {cat_url}")
        lines.append("")
        lines.append(f"Nombre: {unescape_meta(og_title.group(1)) if og_title else product_slug}")
        lines.append(f"URL producto: {og_url.group(1) if og_url else product_url}")
        if sku_m:
            lines.append(f"SKU: {sku_m.group(1).strip()}")
        if price:
            cur = currency.group(1).strip() if currency else ""
            lines.append(f"Precio (meta): {price.group(1).strip()} {cur}".strip())
        lines.append("")
        if og_desc:
            lines.append("Descripción (resumen):")
            lines.append(unescape_meta(og_desc.group(1)))
            lines.append("")
        lines.append("Características (tabla):")
        for th, td in TABLE_ROW_RE.findall(phtml):
            lines.append(f"  - {th.strip()}: {html_lib.unescape(td.strip())}")
        lines.append("")
        lines.append(f"Imagen principal (og:image): {og_img.group(1) if og_img else '(no encontrada)'}")
        lines.append(f"PDF adjunto: {pdf_m.group(1) if pdf_m else '(no disponible)'}")

        (folder / "datos.txt").write_text("\n".join(lines), encoding="utf-8")

        if og_img:
            img_url = html_lib.unescape(og_img.group(1))
            ext = os.path.splitext(urllib.parse.urlparse(img_url).path)[1] or ".jpg"
            try:
                img_data = fetch_bytes(img_url)
                (folder / f"imagen_principal{ext}").write_bytes(img_data)
            except Exception as e:
                print(f"[AVISO] Imagen {img_url}: {e}", file=sys.stderr)

        if pdf_m:
            pdf_url = html_lib.unescape(pdf_m.group(1))
            pdf_name = os.path.basename(urllib.parse.urlparse(pdf_url).path) or "folleto.pdf"
            try:
                pdf_data = fetch_bytes(pdf_url)
                (folder / pdf_name).write_bytes(pdf_data)
            except Exception as e:
                print(f"[AVISO] PDF {pdf_url}: {e}", file=sys.stderr)

        print(f"OK {cat_label} -> {folder.name}")
        count += 1
        time.sleep(0.6)

    print(f"\nTotal carpetas creadas: {count} (máx. {MAX_MAQUINAS})")
    print(f"Salida: {out_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
