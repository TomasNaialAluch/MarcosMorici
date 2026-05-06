#!/usr/bin/env python3
"""
Importa carpetas generadas por download_vialmaq_por_categoria.py a Firestore (colección `equipos`).

La app Next solo LEE `equipos`; las reglas del repo bloquean escritura desde cliente (`allow write: if false`).
Por eso la carga va con Admin SDK + JSON de cuenta de servicio (o GOOGLE_APPLICATION_CREDENTIALS).

Requisitos:
  pip install firebase-admin

Variables / flags:
  - Ruta al JSON: variable de entorno GOOGLE_APPLICATION_CREDENTIALS, o --credentials path.json
  - Por defecto solo muestra lo que haría (--dry-run). Usá --commit para escribir.
  - --only nombre-carpeta  (ej. caterpillar-313gc) para una sola ficha.
  - --pause  espera Enter entre cada documento (carga “una por una” manual).

IDs de documento: se usa el nombre de la carpeta (slug Vialmaq), idempotente al re-ejecutar.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

RE_CAT = re.compile(r"^Categoría \(barra Comprar\):\s*(.+)\s*$")
RE_NOMBRE = re.compile(r"^Nombre:\s*(.+)\s*$")
RE_URL_PROD = re.compile(r"^URL producto:\s*https?://[^/]+/([^?\s#]+)\s*$", re.I)
RE_PRECIO = re.compile(r"^Precio \(meta\):\s*(.+)\s*$", re.I)
RE_DESC_START = re.compile(r"^Descripción \(resumen\):\s*$", re.I)
RE_TABLA_START = re.compile(r"^Características \(tabla\):\s*$", re.I)
RE_TABLA_ROW = re.compile(r"^\s+-\s+(.+?):\s*(.+)\s*$")
RE_IMAGEN = re.compile(r"^Imagen principal \(og:image\):\s*(.+)\s*$", re.I)
RE_PDF = re.compile(r"^PDF adjunto:\s*(.+)\s*$", re.I)


def parse_float_es(value: str) -> float | None:
    v = value.strip().replace(".", "").replace(",", ".") if "," in value else value.strip().replace(",", ".")
    try:
        return float(v)
    except ValueError:
        return None


def parse_int_loose(value: str) -> int | None:
    v = re.sub(r"[^\d]", "", value)
    if not v:
        return None
    try:
        return int(v)
    except ValueError:
        return None


def parse_precio_meta(line: str) -> tuple[float | None, bool]:
    """
    Devuelve (monto_usd_o_none, consultar).
    Si el meta es 0 o vacío, se asume consultar precio.
    """
    raw = line.strip()
    if raw.startswith("(no") or not raw or raw == "(no disponible)":
        return None, True
    m = re.match(r"([\d.,]+)\s*([A-Za-z]{0,3})?", raw)
    if not m:
        return None, True
    num_s = m.group(1)
    n = parse_float_es(num_s)
    if n is None:
        return None, True
    if n <= 0:
        return None, True
    return n, False


def parse_datos_txt(text: str) -> dict:
    lines = text.splitlines()
    categoria = ""
    titulo = ""
    slug_from_url = ""
    precio_line = ""
    descripcion_lines: list[str] = []
    tabla: dict[str, str] = {}
    imagen_url = ""
    pdf_url = ""

    mode = "header"
    for line in lines:
        if mode == "header":
            m = RE_CAT.match(line)
            if m:
                categoria = m.group(1).strip()
                continue
            m = RE_NOMBRE.match(line)
            if m:
                titulo = m.group(1).strip()
                continue
            m = RE_URL_PROD.match(line)
            if m:
                slug_from_url = m.group(1).strip().lower()
                continue
            m = RE_PRECIO.match(line)
            if m:
                precio_line = m.group(1).strip()
                continue
            if RE_DESC_START.match(line):
                mode = "desc"
                continue
            continue

        if mode == "desc":
            if RE_TABLA_START.match(line):
                mode = "tabla"
                continue
            descripcion_lines.append(line)
            continue

        if mode == "tabla":
            m = RE_TABLA_ROW.match(line)
            if m:
                k = m.group(1).strip()
                v = m.group(2).strip()
                tabla[k.lower()] = v
                continue
            m = RE_IMAGEN.match(line)
            if m:
                u = m.group(1).strip()
                if u.startswith("http") and "no encontrada" not in u.lower():
                    imagen_url = u
                continue
            m = RE_PDF.match(line)
            if m:
                u = m.group(1).strip()
                if u.startswith("http") and "no disponible" not in u.lower():
                    pdf_url = u
                continue

    descripcion = "\n".join(descripcion_lines).strip()

    marca = ""
    modelo = ""
    for key in ("marca",):
        for tk, tv in tabla.items():
            if tk == "marca":
                marca = tv
                break
    for tk, tv in tabla.items():
        if tk == "modelo":
            modelo = tv
            break

    ano = None
    for tk, tv in tabla.items():
        if "año" in tk or "ano" in tk:
            ano = parse_int_loose(tv)
            break

    horas = None
    for tk, tv in tabla.items():
        if "hora" in tk:
            horas = parse_int_loose(tv)
            break

    peso_total_kg = None
    for tk, tv in tabla.items():
        if "peso" in tk and "kg" in tk:
            peso_total_kg = parse_int_loose(tv)
            break

    capacidad_balde = None
    for tk, tv in tabla.items():
        if "balde" in tk and "m3" in tk:
            capacidad_balde = parse_float_es(tv.replace("m3", "").replace("m³", ""))
            break

    precio, precio_consultar = parse_precio_meta(precio_line)

    return {
        "categoria": categoria,
        "titulo": titulo,
        "slug_from_url": slug_from_url,
        "descripcion": descripcion or None,
        "marca": marca or "Sin marca",
        "modelo": modelo or "Sin modelo",
        "ano": ano,
        "horas": horas,
        "pesoTotalKg": peso_total_kg,
        "capacidadBaldeM3": capacidad_balde,
        "precio": precio,
        "precioConsultar": precio_consultar,
        "imagen_url": imagen_url,
        "folletoPdfUrl": pdf_url or None,
        "tabla": tabla,
    }


def build_firestore_payload(parsed: dict, doc_slug: str, server_timestamp) -> dict:
    imagenes = [parsed["imagen_url"]] if parsed.get("imagen_url") else []

    doc: dict = {
        "titulo": parsed["titulo"],
        "marca": parsed["marca"],
        "modelo": parsed["modelo"],
        "slug": doc_slug,
        "publicado": True,
        "createdAt": server_timestamp,
        "categoria": parsed["categoria"] or None,
    }
    if parsed.get("descripcion"):
        doc["descripcion"] = parsed["descripcion"]
    if parsed.get("ano") is not None:
        doc["ano"] = parsed["ano"]
    if parsed.get("horas") is not None:
        doc["horas"] = parsed["horas"]
    if parsed.get("pesoTotalKg") is not None:
        doc["pesoTotalKg"] = parsed["pesoTotalKg"]
    if parsed.get("capacidadBaldeM3") is not None:
        doc["capacidadBaldeM3"] = parsed["capacidadBaldeM3"]
    if imagenes:
        doc["imagenes"] = imagenes
    if parsed.get("precio") is not None and not parsed.get("precioConsultar"):
        doc["precio"] = parsed["precio"]
    if parsed.get("precioConsultar"):
        doc["precioConsultar"] = True
    if parsed.get("folletoPdfUrl"):
        doc["folletoPdfUrl"] = parsed["folletoPdfUrl"]

    return doc


def init_firestore(cred_path: str | None):
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print(
            "Falta firebase-admin. Instalá con: pip install firebase-admin",
            file=sys.stderr,
        )
        raise SystemExit(1) from None

    if firebase_admin._apps:
        return firestore.client()
    if cred_path:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
    return firestore.client()


def main() -> int:
    ap = argparse.ArgumentParser(description="Importar muestras Vialmaq a Firestore (equipos).")
    ap.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "vialmaq_muestras_por_categoria",
        help="Carpeta con subcarpetas (una por equipo).",
    )
    ap.add_argument(
        "--credentials",
        type=str,
        default=None,
        help="Ruta al JSON de cuenta de servicio (si no usás GOOGLE_APPLICATION_CREDENTIALS).",
    )
    ap.add_argument(
        "--commit",
        action="store_true",
        help="Sin esto, solo simula (dry-run).",
    )
    ap.add_argument(
        "--only",
        type=str,
        default=None,
        metavar="CARPETA",
        help="Solo importar esta subcarpeta (ej. caterpillar-313gc).",
    )
    ap.add_argument(
        "--pause",
        action="store_true",
        help="Entre cada equipo, pedir Enter antes de continuar.",
    )
    args = ap.parse_args()

    root: Path = args.root
    if not root.is_dir():
        print(f"No existe el directorio: {root}", file=sys.stderr)
        return 1

    cred_path = args.credentials or None
    import os

    if args.commit and not cred_path:
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

    db = None
    server_ts = None
    if args.commit:
        if not cred_path and not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
            print(
                "Para --commit necesitás credenciales: --credentials ruta.json "
                "o variable GOOGLE_APPLICATION_CREDENTIALS.",
                file=sys.stderr,
            )
            return 1
        db = init_firestore(cred_path)
        from firebase_admin import firestore as fs_mod

        server_ts = fs_mod.SERVER_TIMESTAMP

    dirs = sorted([p for p in root.iterdir() if p.is_dir()])
    if args.only:
        dirs = [root / args.only]
        if not dirs[0].is_dir():
            print(f"No existe carpeta: {dirs[0]}", file=sys.stderr)
            return 1

    for folder in dirs:
        datos = folder / "datos.txt"
        if not datos.is_file():
            print(f"[SKIP] {folder.name}: sin datos.txt")
            continue
        text = datos.read_text(encoding="utf-8", errors="replace")
        parsed = parse_datos_txt(text)
        doc_slug = folder.name.lower()
        if parsed["slug_from_url"] and parsed["slug_from_url"] != doc_slug:
            print(
                f"[AVISO] {folder.name}: slug carpeta != URL ({parsed['slug_from_url']}); uso carpeta como id/slug."
            )

        if not parsed.get("imagen_url"):
            print(f"[AVISO] {folder.name}: sin URL de imagen en datos.txt; el catálogo puede verse sin foto.")

        payload = build_firestore_payload(parsed, doc_slug, server_ts or "SERVER_TIMESTAMP")
        # quitar None para no pisar campos opcionales con null si en el futuro usás merge
        payload_clean = {k: v for k, v in payload.items() if v is not None}

        print(f"\n--- {folder.name} ---")
        for k, v in sorted(payload_clean.items()):
            if k == "createdAt":
                continue
            print(f"  {k}: {v!r}")

        if args.pause:
            input("Enter para continuar… ")

        if not args.commit:
            continue

        assert db is not None
        ref = db.collection("equipos").document(doc_slug)
        ref.set(payload_clean)
        print(f"  -> Escrito Firestore equipos/{doc_slug}")

    if not args.commit:
        print("\nModo simulación (dry-run). Repetí con --commit para escribir en Firestore.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
