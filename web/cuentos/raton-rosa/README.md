# KokeCuento · La rosa que cabía en una pata

Lector web independiente de la tienda, pensado para abrir desde el QR de una tarjeta física.

## La historia

Portada y seis escenas. Se conserva literalmente el cuento de `PRODUCTOS[id="raton-rosa"]` de la tienda. La tipografía es HTML real, colocada en espacios libres de las imágenes.

## Animación

- Scroll táctil, rueda o trackpad: desplazamientos, zoom y fundidos, reversibles al retroceder.
- Cada lámina va dentro de un `.cuadro` con la proporción de la ilustración (941 × 1672). Las piezas animadas se colocan en % de ese cuadro, así quedan pegadas al dibujo en móvil y en ordenador.
- Al cambiar de escena, la siguiente aparece entera debajo y la anterior se desvanece encima: no se transparenta el papel entre dos láminas.
- En pantallas anchas la lámina va a la derecha y el texto en la columna izquierda, sin pisar el dibujo.
- **La búsqueda:** hojas de papel que cruzan el jardín.
- **El hallazgo:** la rosa diminuta (`img/03-rosa-pequena.webp`, recortada de la lámina) se balancea sobre su tallo encima de `img/03-hallazgo-fondo.webp`.
- **La noche:** estrella fugaz que cruza el cielo casi en horizontal, con la estela alineada con su movimiento, y la rosa brillando en la pata del ratón.
- **La casa (escenas 5, 6 y 7):** la cámara se acerca a la puerta y luego se aleja sin saltos. En la 6, solo la madera de la puerta (`img/05-hoja-puerta.webp`) gira sobre su bisagra, recortada por el arco; la piedra del marco y la rosa (`img/05-marco-puerta.webp`) quedan fijas delante. Sale la luz de dentro, aparece el ratón blanco y se sonroja, mientras la luna (`img/luna.webp`) baja hasta esconderse tras las colinas.
- **Desenlace:** ya es de madrugada (`img/06-madrugada.webp`).

No hay botones de escena, barra de progreso, audio ni reproducción automática.

## Recursos

Las capas animadas se han sacado de las propias láminas, para que encajen al píxel:

- `03-hallazgo-fondo.webp` + `03-rosa-pequena.webp`: el jardín sin la rosa y la rosa sola.
- `05-puerta-sinluna.webp` + `luna.webp`: la casa con la puerta abierta sin luna, y la luna sola.
- `05-hoja-puerta.webp`: la madera de la puerta cerrada; `05-marco-puerta.webp`: la piedra del arco y la rosa del escalón.
- `06-madrugada.webp`: el desenlace con cielo de madrugada.
- `05-puerta-estatica.webp` y `06-amanecer-estatico.webp` se conservan como originales; `raton-blanco.webp` ya no se usa.

## Pruebas

Desde esta carpeta:

```bash
node --test tests/cuento.test.cjs
python -m http.server 5173
```

Abrir `http://localhost:5173`. También puedes abrir directamente `index.html` desde una carpeta extraída.

Se han ejecutado **cinco pruebas automatizadas**: texto original, recursos de escena, capas de la puerta, ausencia de controles y secuencia reversible de apertura/aparición/rubor mediante DOM simulado. El código supera la verificación de sintaxis de Node.

Revisado en Chrome a 390 × 844 (móvil) y 1280 × 800 (ordenador), recorriendo el cuento entero con scroll.

## Publicación

El cuento permanece en la rama `feature/cuento-raton-rosa-scroll-v1` y la PR #1. No fusionar ni publicar hasta que se valide visualmente. Solo después deberá asignarse una URL definitiva a la tarjeta QR.

### Secuencia narrativa (corrección)

1. Portada y jardín de rosas gigantes.
2. Búsqueda, con varias hojas de papel cayendo al ritmo del scroll.
3. Hallazgo de la rosa diminuta, con un reflejo delicado.
4. Viaje nocturno y estrella fugaz sincronizada con el scroll.
5. **Entrega original restaurada:** el ratón marrón aparece junto a la casa y deja la rosa en el escalón (`img/05-puerta.webp`), mientras aparece la frase original.
6. **Escena nueva sin añadir texto:** el ratón marrón ya no está, la puerta se abre y el ratón blanco descubre la rosa y se sonroja.
7. Desenlace y texto original, con la casa y el ratón blanco.

La secuencia contiene **portada más siete escenas**, ocho láminas en total. La aparición del ratón blanco es una pausa visual sin texto narrativo adicional. No se ha publicado ni fusionado.