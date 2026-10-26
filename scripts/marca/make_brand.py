"""Genera la identidad de Bilwi Noticias como SVG con letras convertidas a trazos.

Uso: python make_brand.py <carpeta-salida>
Fuente: Archivo (OFL), instanciada a wdth 68 / wght 850, la misma del sitio.
"""
import json
import os
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))

INK = "#15171A"
TEAL = "#0A5F63"
WHITE = "#FFFFFF"


def load(wght, wdth):
    font = TTFont(os.path.join(HERE, "Archivo.ttf"))
    return instantiateVariableFont(font, {"wght": wght, "wdth": wdth})


DISPLAY = load(850, 68)
LABEL = load(650, 80)


def text_path(font, text, size, x=0.0, baseline=0.0, tracking=0.0):
    """Devuelve (d, ancho) del texto como trazo, con origen en (x, baseline)."""
    upm = font["head"].unitsPerEm
    scale = size / upm
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    hmtx = font["hmtx"]
    pen = SVGPathPen(glyphs, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
    cursor = 0.0
    for i, char in enumerate(text):
        name = cmap[ord(char)]
        t = TransformPen(pen, (scale, 0, 0, -scale, x + cursor, baseline))
        glyphs[name].draw(t)
        cursor += hmtx[name][0] * scale
        if i < len(text) - 1:
            cursor += tracking * size
    return pen.getCommands(), cursor


def glyph_bounds(font, char, size):
    upm = font["head"].unitsPerEm
    glyphs = font.getGlyphSet()
    name = font.getBestCmap()[ord(char)]
    bp = BoundsPen(glyphs)
    glyphs[name].draw(bp)
    xmin, ymin, xmax, ymax = bp.bounds
    s = size / upm
    return xmin * s, ymin * s, xmax * s, ymax * s, font["hmtx"][name][0] * s


CAP = DISPLAY["OS/2"].sCapHeight / DISPLAY["head"].unitsPerEm  # altura de mayúsculas por em


# ---------- Isotipo: "La ficha" ----------
# Cuadro 100x100, esquinas como las fichas del tablero, B calada y la línea del horizonte.
TILE = 100
RADIUS = 7


def isotipo_parts():
    size = 60 / CAP  # B de 60 unidades de alto
    xmin, ymin, xmax, ymax, adv = glyph_bounds(DISPLAY, "B", size)
    width = xmax - xmin
    x = (TILE - width) / 2 - xmin
    top = 12
    baseline = top + ymax
    b, _ = text_path(DISPLAY, "B", size, x=x, baseline=baseline)
    # La línea del horizonte cruza la ficha de lado a lado: la B se apoya sobre ella.
    bar_y = baseline + 6
    bar = f"M0 {bar_y:.2f}H{TILE}V{bar_y + 5:.2f}H0Z"
    return b, bar


ISO_B, ISO_BAR = isotipo_parts()
TILE_PATH = (
    f"M{RADIUS} 0H{TILE - RADIUS}A{RADIUS} {RADIUS} 0 0 1 {TILE} {RADIUS}V{TILE - RADIUS}"
    f"A{RADIUS} {RADIUS} 0 0 1 {TILE - RADIUS} {TILE}H{RADIUS}A{RADIUS} {RADIUS} 0 0 1 0 {TILE - RADIUS}V{RADIUS}"
    f"A{RADIUS} {RADIUS} 0 0 1 {RADIUS} 0Z"
)


def iso_group(tile_fill, mark_fill, mask_id=None, dx=0.0, dy=0.0, scale=1.0):
    """Ficha a dos tintas, o calada (mark_fill None) con máscara para una sola tinta."""
    tf = f' transform="translate({dx:.2f} {dy:.2f}) scale({scale:.4f})"'
    if mark_fill is None:
        return (
            f'<mask id="{mask_id}" maskUnits="userSpaceOnUse" x="0" y="0" width="{TILE}" height="{TILE}">'
            f'<path d="{TILE_PATH}" fill="#fff"/><path d="{ISO_B}" fill="#000"/><path d="{ISO_BAR}" fill="#000"/></mask>'
            f'<g{tf}><path d="{TILE_PATH}" fill="{tile_fill}" mask="url(#{mask_id})"/></g>'
        )
    return (
        f'<g{tf}><path d="{TILE_PATH}" fill="{tile_fill}"/>'
        f'<path d="{ISO_B}" fill="{mark_fill}"/><path d="{ISO_BAR}" fill="{mark_fill}"/></g>'
    )


def svg(width, height, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.2f} {height:.2f}" '
        f'width="{width:.0f}" height="{height:.0f}" role="img" aria-labelledby="t">'
        f'<title id="t">{title}</title>{body}</svg>\n'
    )


# ---------- Logotipo ----------
WORD_SIZE = 100  # em
BILWI, BILWI_W = text_path(DISPLAY, "BILWI", WORD_SIZE, x=0, baseline=0)
SPACE = DISPLAY["hmtx"][DISPLAY.getBestCmap()[ord(" ")]][0] * WORD_SIZE / DISPLAY["head"].unitsPerEm * 1.05
NOTICIAS, NOTICIAS_W = text_path(DISPLAY, "NOTICIAS", WORD_SIZE, x=BILWI_W + SPACE, baseline=0)
WORD_W = BILWI_W + SPACE + NOTICIAS_W
CAP_H = CAP * WORD_SIZE


def word_group(c1, c2, dx, dy):
    return (
        f'<g transform="translate({dx:.2f} {dy:.2f})">'
        f'<path d="{BILWI}" fill="{c1}"/><path d="{NOTICIAS}" fill="{c2}"/></g>'
    )


PAD = 0  # los archivos van sin margen; el área de protección se documenta aparte

files = {}

# Isotipos
files["isotipo-positivo.svg"] = svg(TILE, TILE, iso_group(INK, WHITE), "Bilwi Noticias, isotipo")
files["isotipo-negativo.svg"] = svg(TILE, TILE, iso_group(WHITE, INK), "Bilwi Noticias, isotipo")
files["isotipo-color.svg"] = svg(TILE, TILE, iso_group(TEAL, WHITE), "Bilwi Noticias, isotipo")
files["isotipo-monocromo-negro.svg"] = svg(TILE, TILE, iso_group(INK, None, "m"), "Bilwi Noticias, isotipo")
files["isotipo-monocromo-blanco.svg"] = svg(TILE, TILE, iso_group(WHITE, None, "m"), "Bilwi Noticias, isotipo")

# Logotipo solo (una línea)
files["logotipo-positivo.svg"] = svg(WORD_W, CAP_H, word_group(INK, TEAL, 0, CAP_H), "Bilwi Noticias")
files["logotipo-negativo.svg"] = svg(WORD_W, CAP_H, word_group(WHITE, WHITE, 0, CAP_H), "Bilwi Noticias")
files["logotipo-monocromo-negro.svg"] = svg(WORD_W, CAP_H, word_group(INK, INK, 0, CAP_H), "Bilwi Noticias")
files["logotipo-monocromo-blanco.svg"] = svg(WORD_W, CAP_H, word_group(WHITE, WHITE, 0, CAP_H), "Bilwi Noticias")

# Logo horizontal: ficha + nombre. La ficha mide 1.45 veces la altura de mayúsculas.
TILE_H = CAP_H * 1.45
GAP = TILE_H * 0.28
H_W = TILE_H + GAP + WORD_W
word_y = (TILE_H + CAP_H) / 2


def horizontal(tile_fill, mark_fill, c1, c2, mask_id=None):
    return iso_group(tile_fill, mark_fill, mask_id, 0, 0, TILE_H / TILE) + word_group(c1, c2, TILE_H + GAP, word_y)


files["logo-horizontal-positivo.svg"] = svg(H_W, TILE_H, horizontal(INK, WHITE, INK, TEAL), "Bilwi Noticias")
files["logo-horizontal-negativo.svg"] = svg(H_W, TILE_H, horizontal(WHITE, INK, WHITE, WHITE), "Bilwi Noticias")
files["logo-horizontal-monocromo-negro.svg"] = svg(H_W, TILE_H, horizontal(INK, None, INK, INK, "m"), "Bilwi Noticias")
files["logo-horizontal-monocromo-blanco.svg"] = svg(H_W, TILE_H, horizontal(WHITE, None, WHITE, WHITE, "m"), "Bilwi Noticias")

# Logo vertical: ficha arriba, nombre en dos líneas debajo, centrado.
V_TILE = CAP_H * 2.4
LINE_GAP = CAP_H * 0.28
V_W = max(BILWI_W, NOTICIAS_W, V_TILE)
NOT_ONLY, _ = text_path(DISPLAY, "NOTICIAS", WORD_SIZE, x=0, baseline=0)
v_top_text = V_TILE + CAP_H * 0.45
V_H = v_top_text + CAP_H * 2 + LINE_GAP


def vertical(tile_fill, mark_fill, c1, c2, mask_id=None):
    return (
        iso_group(tile_fill, mark_fill, mask_id, (V_W - V_TILE) / 2, 0, V_TILE / TILE)
        + f'<g transform="translate({(V_W - BILWI_W) / 2:.2f} {v_top_text + CAP_H:.2f})"><path d="{BILWI}" fill="{c1}"/></g>'
        + f'<g transform="translate({(V_W - NOTICIAS_W) / 2:.2f} {v_top_text + CAP_H * 2 + LINE_GAP:.2f})"><path d="{NOT_ONLY}" fill="{c2}"/></g>'
    )


files["logo-vertical-positivo.svg"] = svg(V_W, V_H, vertical(INK, WHITE, INK, TEAL), "Bilwi Noticias")
files["logo-vertical-negativo.svg"] = svg(V_W, V_H, vertical(WHITE, INK, WHITE, WHITE), "Bilwi Noticias")
files["logo-vertical-monocromo-negro.svg"] = svg(V_W, V_H, vertical(INK, None, INK, INK, "m"), "Bilwi Noticias")
files["logo-vertical-monocromo-blanco.svg"] = svg(V_W, V_H, vertical(WHITE, None, WHITE, WHITE, "m"), "Bilwi Noticias")

for name, content in files.items():
    with open(os.path.join(OUT, name), "w", encoding="utf8", newline="\n") as fh:
        fh.write(content)

# Datos para el componente React (trazos con currentColor).
TAG, _ = text_path(LABEL, "COSTA CARIBE NORTE DE NICARAGUA", 100, tracking=0.08)
TAG_W = _
data = {
    "tile": TILE,
    "tilePath": TILE_PATH,
    "isoB": ISO_B,
    "isoBar": ISO_BAR,
    "bilwi": BILWI,
    "noticias": NOTICIAS,
    "wordWidth": round(WORD_W, 2),
    "capHeight": round(CAP_H, 2),
    "bilwiWidth": round(BILWI_W, 2),
    "noticiasWidth": round(NOTICIAS_W, 2),
    "noticiasAlone": NOT_ONLY,
    "tagline": TAG,
    "taglineWidth": round(TAG_W, 2),
    "taglineCap": round(LABEL["OS/2"].sCapHeight / LABEL["head"].unitsPerEm * 100, 2),
    "horizontal": {"tileH": round(TILE_H, 2), "gap": round(GAP, 2), "width": round(H_W, 2)},
}
with open(os.path.join(HERE, "brand-data.json"), "w", encoding="utf8") as fh:
    json.dump(data, fh)
print("ok", len(files), "svg", "cap", round(CAP, 3), "word", round(WORD_W, 1), "x", round(CAP_H, 1))
