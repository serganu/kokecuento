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
- **El hallazgo:** destello y pulso de luz sobre la rosa diminuta.
- **La noche:** estrella fugaz y la rosa brillando en la pata del ratón.
- **La casa (escenas 5, 6 y 7):** la cámara se acerca a la puerta y luego se aleja sin saltos. En la 6, la hoja de la puerta (`img/05-hoja-puerta.webp`, recortada de `05-puerta.webp`) gira sobre su bisagra encima de `05-puerta-estatica.webp`, sale la luz de dentro, aparece el ratón blanco y se sonroja.

No hay botones de escena, barra de progreso, audio ni reproducción automática.

## Recursos

- `img/05-hoja-puerta.webp`: hoja de la puerta cerrada con transparencia, para animarla.
- `img/05-puerta-estatica.webp` y `img/06-amanecer-estatico.webp`: fondos de la puerta y del desenlace, y láminas fijas sin JavaScript o con movimiento reducido.
- `img/raton-blanco.webp` ya no se usa en la animación (el ratón blanco está dentro de la lámina de la puerta abierta).

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