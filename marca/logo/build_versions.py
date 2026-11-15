"""Genera todas las versiones y tamaños del logo a partir de los maestros.

Uso (desde la carpeta marca, después de build_logo.py):  python logo/build_versions.py
Salida: logo/png, logo/redes, logo/web y los SVG compuestos en logo/svg
"""
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
WORK, SVG = ROOT / "_work", ROOT / "svg"
PNG, REDES, WEB = ROOT / "png", ROOT / "redes", ROOT / "web"
for d in (PNG, REDES, WEB):
    d.mkdir(exist_ok=True)

PAPEL = (252, 250, 248)          # fondo de la imagen original (#FCFAF8)
PAPEL_HEX = "#FCFAF8"

hor = Image.open(WORK / "horizontal.png")
sym = Image.open(WORK / "simbolo.png")
txt = Image.open(WORK / "texto.png")


def fit(img, w=None, h=None):
    if w is None:
        w = round(img.width * h / img.height)
    if h is None:
        h = round(img.height * w / img.width)
    s = min(w / img.width, h / img.height)
    return img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)


def canvas(size, img, bg=None, scale=0.8, dy=0.0):
    """Centra img en un lienzo, ocupando 'scale' del lado más ajustado."""
    W, H = size
    c = Image.new("RGBA", size, (*bg, 255) if bg else (0, 0, 0, 0))
    f = fit(img, w=round(W * scale), h=round(H * scale))
    c.alpha_composite(f, ((W - f.width) // 2, (H - f.height) // 2 + round(H * dy)))
    return c


def save(img, path, flat=False):
    if flat:
        img = img.convert("RGB")
    img.save(path, optimize=True)
    print("ok", path.relative_to(ROOT), img.size)


def vertical():
    """Símbolo arriba y nombre debajo."""
    t = fit(txt, w=round(sym.width * 1.2))
    gap = round(sym.height * 0.02)
    W = max(sym.width, t.width)
    c = Image.new("RGBA", (W, sym.height + gap + t.height), (0, 0, 0, 0))
    c.alpha_composite(sym, ((W - sym.width) // 2, 0))
    c.alpha_composite(t, ((W - t.width) // 2, sym.height + gap))
    return c


ver = vertical()

# ---- Logo en PNG (fondo transparente y fondo papel) ----
for w in (2400, 1200, 600):
    save(fit(hor, w=w), PNG / f"kokecuento-horizontal-{w}.png")
save(canvas((2400, 1100), hor, PAPEL, 0.86), PNG / "kokecuento-horizontal-fondo-2400.png", flat=True)
for w in (1600, 800):
    save(fit(ver, w=w), PNG / f"kokecuento-vertical-{w}.png")
save(canvas((1600, 1600), ver, PAPEL, 0.8), PNG / "kokecuento-vertical-fondo-1600.png", flat=True)
for w in (1024, 512):
    save(canvas((w, w), sym, None, 0.94), PNG / f"kokecuento-simbolo-{w}.png")
save(fit(txt, w=1600), PNG / "kokecuento-nombre-1600.png")

# ---- Redes sociales ----
# Avatar: el símbolo dentro de la zona segura del círculo con que recortan Instagram y TikTok
save(canvas((1080, 1080), sym, PAPEL, 0.6, dy=-0.01), REDES / "avatar-1080.png", flat=True)
save(canvas((1080, 1080), ver, PAPEL, 0.78), REDES / "post-cuadrado-1080.png", flat=True)
save(canvas((1080, 1920), ver, PAPEL, 0.7), REDES / "historia-1080x1920.png", flat=True)
save(canvas((1200, 630), hor, PAPEL, 0.8), REDES / "compartir-enlace-1200x630.png", flat=True)
save(canvas((1640, 624), hor, PAPEL, 0.62), REDES / "portada-facebook-1640x624.png", flat=True)

# ---- Web ----
save(fit(hor, h=160), WEB / "logo-cabecera@2x.png")
save(fit(hor, h=80), WEB / "logo-cabecera.png")
save(fit(hor, w=600), WEB / "logo-email-600.png")
icon = canvas((1024, 1024), sym, PAPEL, 0.86)
for s, name in ((512, "icono-512.png"), (192, "icono-192.png"), (180, "apple-touch-icon.png"),
                (48, "favicon-48.png"), (32, "favicon-32.png"), (16, "favicon-16.png")):
    save(icon.resize((s, s), Image.LANCZOS), WEB / name, flat=True)
icon.convert("RGB").save(WEB / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("ok web/favicon.ico")


# ---- SVG compuestos (vectores escalables) ----
def inner(name):
    s = (SVG / f"kokecuento-{name}.svg").read_text(encoding="utf-8")
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    body = s[s.index(">", s.index("<svg")) + 1: s.rindex("</svg>")]
    return body, vb[2], vb[3]


sb, sw, sh = inner("simbolo")
tb, tw, th = inner("texto")


def write_svg(name, w, h, parts, bg=False):
    rect = f'<rect width="{w}" height="{h}" fill="{PAPEL_HEX}"/>' if bg else ""
    body = "".join(f'<g transform="translate({x:.1f} {y:.1f}) scale({k:.4f})">{b}</g>' for b, x, y, k in parts)
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
           f'width="{w / 4:.0f}" height="{h / 4:.0f}">{rect}{body}</svg>\n')
    p = SVG / f"kokecuento-{name}.svg"
    p.write_text(out, encoding="utf-8")
    print("ok", p.relative_to(ROOT), f"{p.stat().st_size // 1024} KB")


# Horizontal: mismas posiciones que en la imagen original (coordenadas ×4)
tx, ty = (625 - 130) * 4, (560 - 257) * 4
write_svg("horizontal", hor.width, hor.height, [(sb, 0, 0, 1), (tb, tx, ty, 1)])
write_svg("horizontal-fondo", hor.width + 400, hor.height + 400, [(sb, 200, 200, 1), (tb, tx + 200, ty + 200, 1)], bg=True)
# Vertical
k = sw * 1.2 / tw
W = max(sw, tw * k)
write_svg("vertical", W, sh + sh * 0.02 + th * k, [(sb, (W - sw) / 2, 0, 1), (tb, (W - tw * k) / 2, sh * 1.02, k)])
