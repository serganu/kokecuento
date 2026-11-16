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