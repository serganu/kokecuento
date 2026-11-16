# KokeCuento · Prototipo de «La rosa que cabía en una pata»

Estado: **primera versión en rama de desarrollo**. No está integrada en la ficha de producto ni publicada en `main`.

## Alcance

- Página independiente: `web/cuentos/raton-rosa/index.html`. Cuando se publique deliberadamente en GitHub Pages, la ruta pública podrá incluirse en la tarjeta QR.
- Portada + 6 pasajes, textos HTML superpuestos en espacios vacíos de la ilustración a pantalla completa.
- Scroll con dedo, rueda o trackpad. Movimientos de capas completos (desplazamiento, zoom, rotación suave), disolvencias y cambio día/noche.
- **Sin barra de progreso, autoplay, audio ni controles de escena**.
- Ratón **exactamente el recurso original** `web/img/personajes/raton.webp`. No se modifica ni articulan sus patas.
- Texto canónico obtenido de `PRODUCTOS[id=raton-rosa].cuento`. El HTML incluye una copia literal como respaldo, validada contra el texto del catálogo al cargar.
- Flores y casa: **arte provisional en SVG/CSS** para validar el movimiento. No son ilustraciones definitivas; sustituir más adelante por capas de origami autorizadas, sin alterar el ratón.

## Funcionamiento

El fondo visual `#escenario` permanece fijo; los siete pasajes HTML se desplazan en el documento. Cada tramo controla una lámina independiente por posición de scroll. Al final de cada tramo las láminas se funden suavemente. El texto permanece en HTML (seleccionable y accesible), sin cajas opacas.

La animación utiliza `requestAnimationFrame` y `transform/opacity`, sin vídeo, canvas ni dependencias JS. `prefers-reduced-motion` mantiene la narración legible sin animación.

## Comprobación manual pendiente

1. Abrir `python -m http.server 5173 --directory web` y visitar `http://localhost:5173/cuentos/raton-rosa/`.
2. En móvil vertical, leer todas las frases sin que ningún elemento visual invada el texto. Probar pantallas pequeñas.
3. En escritorio, probar rueda y trackpad; comprobar que al subir se revierten los movimientos.
4. Verificar ausencia de saltos bruscos entre fondo diurno, noche y amanecer.
5. Activar reducción de movimiento y comprobar que todas las frases se leen.
6. Comprobar el ratón original frente a la imagen del catálogo. Evaluar si las rosas de prueba deben reemplazarse.
7. Evaluar LCP, CLS y comportamiento con conexión móvil lenta.

## Pendiente antes de cualquier publicación

- Sustituir los paisajes, rosas y puerta provisionales por arte final con capas independientes.
- Validación visual real en navegadores y tamaños de pantalla, incluidas pruebas de contraste.
- Ajustar la continuidad de la flor al ser transportada y depositada, sin redibujar las patas del ratón.
- Confirmar la URL permanente del QR y las condiciones de distribución de las tarjetas.
- No hacer merge ni desplegar automáticamente hasta autorización expresa.

## Segunda iteración: accesibilidad y lectura

- La primera rosa gigante se ha desplazado hacia la parte inferior en pantallas estrechas, donde el texto tiene prioridad.
- La duración de los tramos se ha reducido para no exigir un desplazamiento desproporcionado a un cuento breve.
- Las escenas incluyen descripciones para lectores de pantalla, sin mostrar etiquetas visuales.
- En modo de movimiento reducido el fondo cambia **sin transiciones** entre escenas, conservando los dibujos de cada pasaje en lugar de dejar fija la portada.
- Se activa aceleración de transformaciones únicamente en las capas de las láminas presentes.

### Comprobaciones automáticas

`node --test web/cuentos/raton-rosa/tests/cuento.test.cjs`

La prueba automatizada utiliza un DOM simulado, sin navegador ni dependencias, para comprobar la segmentación del texto original, la continuidad de escenas y la ausencia de movimiento en el modo reducido. No reemplaza una prueba visual en móvil.
