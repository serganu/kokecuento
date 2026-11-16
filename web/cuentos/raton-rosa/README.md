# KokeCuento · La rosa que cabía en una pata

Una experiencia de lectura independiente, pensada para el QR de la tarjeta física que acompaña a la kokedama. Sin vínculo obligatorio con la ficha del producto.

## Qué incluye esta versión

- Portada y seis escenas ilustradas a ventana completa, sin barras ni botones de navegación de escena.
- Texto original del cuento, integrado en los espacios libres del escenario mediante HTML.
- Desplazamiento natural desde móvil, rueda o trackpad; transiciones reversibles por posición de scroll.
- Animaciones deliberadamente sencillas: zoom, panorámica muy leve y fundido entre ilustraciones completas.
- Arte de origami basado en los dibujos aprobados. No se manipula la anatomía del ratón en tiempo de ejecución.
- Imágenes WebP comprimidas, una hoja de estilo y un script JavaScript. Sin dependencias de animación.
- Alternativa estática para usuarios que soliciten reducir movimiento.

## Prueba local

Desde la raíz de `web/`, ejecutar `python -m http.server 5173 --directory web` y abrir `/cuentos/raton-rosa/`.
Si se utiliza el ZIP independiente, ejecutar `python -m http.server 5173` desde la carpeta extraída y abrir `http://localhost:5173/`.

Pruebas estáticas: `node --test tests/cuento.test.cjs`.

## Notas de producción

Esta versión utiliza las ilustraciones aprobadas como **láminas completas**. Solo se animan mediante movimiento de cámara, escala y opacidad, para evitar alteraciones del ratón entre fotogramas. El ratón está incorporado dentro de cada ilustración, y algunas poses (como llevar la rosa) se generaron específicamente para la escena. Aunque el modelo visual mantiene la estética aprobada, no son copias idénticas píxel a píxel de `web/img/personajes/raton.webp`.

La portada y la escena del hallazgo reutilizan la misma ilustración con un encuadre distinto. El final vuelve a la puerta con una iluminación más cálida y un acercamiento de cámara. Si se desea un final totalmente distinto, necesitará una ilustración adicional.

Las imágenes de jardín generadas originalmente con texto incrustado se han adaptado para recuperar las zonas de papel limpio; todo el texto visible ahora es HTML. Los fondos y personajes no están separados todavía por capas, lo que limita la animación a movimientos sencillos de cámara. Este es exactamente el alcance fijado para el primer cuento.

El proyecto no requiere publicar ni modificar la tienda existente para validar su funcionamiento.

## Pendientes antes de darlo por definitivo

1. Prueba visual real en móviles y escritorio, incluyendo pantallas pequeñas y Safari iOS. En el entorno de generación, Chromium está bloqueado por la política de navegación y no se ha podido realizar la prueba interactiva automatizada.
2. Verificar contraste y posiciones del texto durante los tramos de transición.
3. Confirmar URL pública final antes de imprimir QR; no imprimir tarjetas con enlaces de prueba.
4. Revisar con atención la igualdad de los personajes entre escenas si se requiere una conservación absolutamente exacta del recurso maestro original.