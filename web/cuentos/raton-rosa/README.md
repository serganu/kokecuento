# KokeCuento · La rosa que cabía en una pata

Lector web independiente de la tienda, pensado para abrir desde el QR de una tarjeta física.

## La historia

Portada y seis escenas. Se conserva literalmente el cuento de `PRODUCTOS[id="raton-rosa"]` de la tienda. La tipografía es HTML real, colocada en espacios libres de las imágenes.

## Animación

- Scroll táctil, rueda o trackpad: desplazamientos, zoom y fundidos, reversibles al retroceder.
- **La búsqueda:** una hoja de papel se desplaza sobre el jardín como elemento independiente de la ilustración.
- **Viaje nocturno:** un pequeño lucero gana luz al avanzar.
- **La puerta:** la escena utiliza un fondo sin ratón marrón, una hoja de puerta animable, un **ratón blanco recortado e independiente** y un rubor progresivo. El scroll abre la puerta, presenta al personaje y colorea sus mejillas cuando observa la rosa.
- **Desenlace:** conserva la puerta abierta y al ratón blanco con luz más cálida; el ratón marrón no aparece.

No hay botones de escena, barra de progreso, audio ni reproducción automática.

## Recursos

- `img/05-puerta-fondo.webp`: puerta y rosa sin protagonista.
- `img/raton-blanco.webp`: personaje aislado con transparencia.
- `img/05-puerta-estatica.webp` y `img/06-amanecer-estatico.webp`: composiciones terminadas para lectura sin JavaScript o con movimiento reducido.
- El resto de láminas siguen siendo ilustraciones completas: solo la hoja viajera, el lucero y la escena de la puerta cuentan actualmente con elementos independientes.

**El ratón marrón original del catálogo no se modifica.** Las ilustraciones anteriores se crearon siguiendo su lenguaje gráfico, pero son imágenes independientes y no garantizan identidad perfecta píxel a píxel. El ratón blanco es un personaje nuevo dentro de ese mismo estilo.

## Pruebas

Desde esta carpeta:

```bash
node --test tests/cuento.test.cjs
python -m http.server 5173
```

Abrir `http://localhost:5173`. También puedes abrir directamente `index.html` desde una carpeta extraída.

Se han ejecutado **cinco pruebas automatizadas**: texto original, recursos de escena, capas de la puerta, ausencia de controles y secuencia reversible de apertura/aparición/rubor mediante DOM simulado. El código supera la verificación de sintaxis de Node.

**Limitación:** la navegación local en Chromium del entorno está bloqueada por políticas administrativas; no se ha podido completar una prueba visual real en móvil o escritorio. El acabado y la legibilidad deben verificarse antes de publicar.

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