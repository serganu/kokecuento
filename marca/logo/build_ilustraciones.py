"""Quita el fondo de las ilustraciones de ChatGPT y las guarda recortadas para la web.

Uso (desde la carpeta Kokedamas):  python marca/logo/build_ilustraciones.py
Entrada: marca/original/ilustraciones/*.webp
Salida:  web/img/personajes y web/img/productos (WebP con transparencia)
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "marca" / "original" / "ilustraciones"
DEST = {"raton": "personajes", "zorro": "personajes", "lobo": "personajes",
        "rosa": "productos", "pascua": "productos", "acebo": "productos"}
TOL = 10

for name, folder in DEST.items():
    im = Image.open(SRC / f"{name}.webp").convert("RGB")
    big = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    a = np.asarray(big).astype(np.int16)
    bg = np.median(a[:40].reshape(-1, 3), axis=0)
    near = np.abs(a - bg).max(axis=2) <= TOL
    lab, _ = ndimage.label(near)                       # solo el fondo conectado con el borde
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    back = np.isin(lab, edge[edge > 0])
    if folder == "productos":                          # las plantas no tienen blancos propios:
        back |= near                                   # también se quitan los huecos entre tallos
    back = ndimage.binary_dilation(back, iterations=2)
    alpha = np.clip(ndimage.gaussian_filter((~back).astype(np.float32), 1.0), 0, 1)
    out = Image.fromarray(np.dstack([np.asarray(big), (alpha * 255).astype(np.uint8)]), "RGBA")
    out = out.crop(out.getbbox())
    out.thumbnail((900, 900), Image.LANCZOS)
    dest = ROOT / "web" / "img" / folder / f"{name}.webp"
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, quality=90, method=6)
    print("ok", dest.relative_to(ROOT), out.size, f"{dest.stat().st_size // 1024} KB")
