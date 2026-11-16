# Kokecuento · La rosa que cabía en una pata

Lector web independiente de la tienda, pensado para abrir desde el QR de una tarjeta física. Trabajo en la rama `feature/cuento-raton-rosa-scroll-v1`, PR #1 **sin publicar ni fusionar**.

## Historia y animación

Portada + siete escenas. El texto del cuento se conserva literal y permanece como HTML, sobre zonas vacías de las ilustraciones a pantalla completa. Scroll táctil, ratón o trackpad; todos los gestos son reversibles al subir y se detienen cuando el lector deja de desplazarse.

1. Jardín de rosas grandes.
2. Búsqueda: **cuatro hojas independientes recortadas de la propia ilustración**, no polígonos CSS. Caen desde la vegetación con ritmos y derivas diferentes.
3. Hallazgo: corola de la rosa diminuta recortada del dibujo original. Se inclina suavemente en su posición real, dejando el tallo y las hojas en el fondo, sin destellos artificiales.
4. Noche: estrella fugaz que cruza una zona despejada del cielo, sin invadir la luna ni el texto, siguiendo el scroll.
5. Entrega original: el ratón marrón deja la rosa en el escalón de la casa (`img/05-puerta.webp`).
6. Reacción sin texto añadido: **puerta de madera recortada de la ilustración original**, abre sobre su bisagra; aparece el ratón blanco y se sonroja.
7. Desenlace: casa, rosa y ratón blanco visibles; texto final original.

Ninguna escena tiene barra de progreso, reproducción automática, sonido ni movimiento articulado complejo.

## Alineación visual

Las capas de búsqueda, hallazgo y noche comparten con su fondo un contenedor `.plano-ilustracion` cuya proporción coincide con las dimensiones reales de cada imagen: 960×1440 (búsqueda) y 941×1672 (hallazgo/noche). Los elementos se posicionan en ese mismo sistema de coordenadas, tanto si la imagen se recorta en móvil como si se contiene en escritorio. Los recortes llevan los mismos píxeles y textura que la ilustración base.

La corola utiliza `rosa-corola.webp` sobre `03-hallazgo-sin-corola.webp`; el texto mantiene como imagen de respaldo el arte original sin separar (`03-hallazgo.webp`). La puerta recupera la textura del dibujo original mediante `puerta-papel.webp`. El original del ratón marrón no se altera.

## Recursos

- `img/hoja-papel-ancha.webp` y `img/hoja-papel-corta.webp`: hojas del escenario 02, recortadas con transparencia.
- `img/rosa-corola.webp` y `img/03-hallazgo-sin-corola.webp`: capas para animar el hallazgo.
- `img/puerta-papel.webp`: madera original preparada como hoja articulable.
- `img/05-puerta.webp`: entrega del ratón marrón, conservada.
- `img/05-puerta-fondo.webp` y `img/raton-blanco.webp`: escenario y ratón blanco independientes.
- `img/05-puerta-estatica.webp` y `img/06-amanecer-estatico.webp`: alternativas sin movimiento.

## Verificación

`node --check cuento.js` y `node --test tests/cuento.test.cjs`.

Ocho pruebas automatizadas comprueban texto original, ocho láminas, recursos, capas y scroll reversible. Además, el cuento se ha renderizado en Chromium **mediante HTML, CSS e imágenes incrustadas localmente** a 390×844 y 1365×768, verificando visualmente la posición de las hojas, la rosa, la estrella y la puerta. El navegador de este entorno bloquea la navegación a `127.0.0.1`, así que sigue pendiente verificar la carga externa de la previsualización y la lectura en un móvil físico.

## Publicación

Rama de revisión y PR #1. No fusionar ni publicar hasta la aprobación. Solo después se asignará la URL permanente de la tarjeta QR.

## Corrección de escena final (noviembre 2026)
Se sustituyó el hueco negro de la puerta por una textura de interior cálido procedente de la ilustración de origami. La puerta de madera se separó del arco de piedra y de la rosa, que permanecen fijos. El fondo de la casa se mantiene completo y a la derecha en formato panorámico. El ratón blanco aparece únicamente después de la entrega del ratón marrón. La revisión visual real en varios tamaños sigue siendo obligatoria antes de publicar.

### V5 · Reparación del desenlace

- La escena del ratón marrón dejando la rosa permanece antes de la reacción del ratón blanco.
- El fondo de las dos escenas finales es ahora `img/05-casa-interior.webp`: la casa, el jardín y la rosa siguen dibujados y el hueco oscuro del vano se sustituyó por un interior de papel iluminado.
- `img/05-puerta-hoja-limpia.webp` contiene solo la hoja de madera animable, sin arrastrar el arco ni la rosa. Se mantiene el giro con el scroll, pero la casa no se mueve.
- Las escenas de apertura y desenlace comparten exactamente el mismo encuadre y no producen imagen fantasma en la transición.
- Las alternativas estáticas (`05-puerta-estatica.webp` y `06-amanecer-estatico.webp`) reflejan el fondo corregido.
- Antes del merge, revisar el acabado en navegadores reales y tamaños pequeños/grandes. El entorno impide navegar a archivos locales, aunque se ha comprobado una representación incrustada en Chromium móvil.