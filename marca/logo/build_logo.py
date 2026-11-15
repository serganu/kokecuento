"""Genera los archivos maestros del logo de KokeCuento a partir de la imagen original.

Uso (desde la carpeta marca):  python logo/build_logo.py
Entrada: original/kokecuento-original.webp
Salida:  logo/_work/*.png (recortes sin fondo) y logo/svg/*.svg (vectorizado fiel)
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage
import vtracer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "original" / "kokecuento-original.webp"
WORK = ROOT / "logo" / "_work"
SVG = ROOT / "logo" / "svg"
WORK.mkdir(parents=True, exist_ok=True)
SVG.mkdir(parents=True, exist_ok=True)

SCALE = 4          # ampliación antes de vectorizar, para bordes más suaves
TOL = 9            # tolerancia de color respecto al fondo
PAD = 12           # margen alrededor de cada recorte (px del original)
# Cajas medidas en la imagen original (x0, y0, x1, y1)
BOX_ALL = (130, 257, 1338, 785)
BOX_SYM = (130, 257, 590, 785)
BOX_TXT = (625, 560, 1338, 710)
BOX_PLANT = (215, 250, 575, 545)


def cutout():
    """Devuelve la imagen ampliada con el fondo transparente."""
    im = Image.open(SRC).convert("RGB")
    big = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
    a = np.asarray(big).astype(np.int16)
    bg = np.median(a[:60].reshape(-1, 3), axis=0)
    near = np.abs(a - bg).max(axis=2) <= TOL
    # Solo es fondo lo que está conectado con el borde de la imagen:
    # así no se borran los blancos interiores (ratón blanco, pecho del lobo).
    lab, _ = ndimage.label(near)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    back = np.isin(lab, edge[edge > 0])
    # Los huecos cerrados de las letras (o, e) también son fondo.
    x0, y0, x1, y1 = [v * SCALE for v in BOX_TXT]
    back[y0:y1, x0:x1] |= near[y0:y1, x0:x1]
    # Igual en la zona de la planta (no hay blancos propios por encima de los animales).
    x0, y0, x1, y1 = [v * SCALE for v in BOX_PLANT]
    back[y0:y1, x0:x1] |= near[y0:y1, x0:x1]
    back = ndimage.binary_dilation(back, iterations=2)   # recorta el halo claro del borde
    rgb = np.asarray(big)
    soft = ndimage.gaussian_filter((~back).astype(np.float32), 1.0)
    png = Image.fromarray(np.dstack([rgb, (np.clip(soft, 0, 1) * 255).astype(np.uint8)]), "RGBA")
    # Para vectorizar: borde duro y textura del papel suavizada (menos trazos, mismo dibujo).
    smooth = ndimage.median_filter(rgb, size=(7, 7, 1))
    hard = Image.fromarray(np.dstack([smooth, ((~back) * 255).astype(np.uint8)]), "RGBA")
    return png, hard


def crop(img, box):
    x0, y0, x1, y1 = box
    return img.crop(((x0 - PAD) * SCALE, (y0 - PAD) * SCALE, (x1 + PAD) * SCALE, (y1 + PAD) * SCALE))


def trace(png, svg, detail=True):
    vtracer.convert_image_to_svg_py(
        str(png), str(svg), colormode="color", hierarchical="stacked", mode="spline",
        filter_speckle=24 if detail else 12, color_precision=8 if detail else 3,
        layer_difference=12 if detail else 64,
        corner_threshold=60, length_threshold=6.0, splice_threshold=45, path_precision=1,
    )
    # viewBox para que el SVG se pueda escalar a cualquier tamaño
    w, h = Image.open(png).size
    s = svg.read_text(encoding="utf-8")
    s = s.replace(f'width="{w}" height="{h}"', f'viewBox="0 0 {w} {h}" width="{w // SCALE}" height="{h // SCALE}"', 1)
    svg.write_text(s, encoding="utf-8")
    print("ok", svg.name, f"{svg.stat().st_size // 1024} KB")


def main():
    img, hard = cutout()
    crop(img, BOX_ALL).save(WORK / "horizontal.png")
    for name, box in [("simbolo", BOX_SYM), ("texto", BOX_TXT)]:
        crop(img, box).save(WORK / f"{name}.png")
        tmp = WORK / f"{name}-trazo.png"
        crop(hard, box).save(tmp)
        trace(tmp, SVG / f"kokecuento-{name}.svg", detail=(name == "simbolo"))


if __name__ == "__main__":
    main()
