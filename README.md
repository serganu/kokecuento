# KokeCuento

Kokedamas hechas a mano que cuentan historias. Este repositorio contiene la tienda web y los archivos de la marca.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `web/` | La tienda: web estática en HTML, CSS y JavaScript, sin proceso de compilación |
| `marca/original/` | Imágenes originales del logo y de las ilustraciones |
| `marca/logo/` | Logo en todas sus versiones (`svg`, `png`, `redes`, `web`) y los scripts que las generan |
| `marca/logos-kokecuento.html` | Página resumen de la identidad visual |

## Ver la web en local

```bash
python -m http.server 5173 --directory web
```

Después abre <http://localhost:5173>.

## Cambiar productos, precios y textos

Todo el contenido de la tienda está en `web/js/productos.js`:

- `TIENDA`: coste de envío, días de preparación, Instagram y correo.
- `GAMAS`: Ratón, Zorro y Lobo, con su tamaño.
- `PLANTAS`: nombre, ilustración, cuidados y avisos de cada planta.
- `PRODUCTOS`: precio, cuento, enlace de pago (`enlacePago`) y foto (`foto`) de cada kokedama.

Mientras `enlacePago` esté vacío, el botón de compra muestra «Disponible muy pronto».

## Regenerar las imágenes de marca

Requiere Python con `pillow`, `numpy`, `scipy` y `vtracer`.

```bash
python marca/logo/build_logo.py
python marca/logo/build_versions.py
python marca/logo/build_ilustraciones.py
```

## Pendiente antes de publicar

- Enlaces de pago de Stripe.
- Fotos reales de los productos.
- Páginas legales: aviso legal, privacidad y condiciones de venta.
- Dominio y alojamiento.
