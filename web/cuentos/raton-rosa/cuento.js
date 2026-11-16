/* El cuento avanza con el scroll (dedo, rueda o trackpad) y todo es reversible al subir.
   Cada pasaje de texto tiene su lámina. Dentro de un pasaje, "progreso" va de 0 a 1;
   al final de cada pasaje la lámina siguiente aparece debajo y la actual se desvanece encima,
   así nunca se transparenta el papel entre dos ilustraciones. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return; // el CSS pone una ilustración fija en cada pasaje

  const escenas = [...document.querySelectorAll('[data-lamina]')];
  const pasajes = [...document.querySelectorAll('[data-pasaje]')];
  if (escenas.length !== pasajes.length || !escenas.length) return;

  const limite = (n) => Math.max(0, Math.min(1, n));
  const interv = (x, a, b) => limite((x - a) / (b - a));
  const suave = (t) => t * t * (3 - 2 * t);           // arranca y frena con suavidad
  const num = (el, k, d = 0) => Number(el.dataset[k] ?? d);
  const posiciones = [];
  let pendiente = false;

  /* Lo que se mueve dentro de cada lámina. Cada función recibe el progreso (0-1) del pasaje. */
  const efectos = {
    // La búsqueda: hojas de papel que cruzan el jardín
    2: (c, p) => c.querySelectorAll('.hoja-viajera').forEach((hoja, i) => {
      const vis = interv(p, .08 + i * .04, .28 + i * .05) * (1 - interv(p, .72 + i * .02, .95)) * (.9 - i * .08);
      const dx = [-260, -170, -330, -200][i], dy = [90, -30, 150, 60][i], giro = [58, -42, 77, 33][i];
      hoja.style.opacity = vis.toFixed(3);
      hoja.style.transform = `translate(${dx * p}%,${dy * p}%) rotate(${-18 + p * giro}deg)`;
    }),
    // El hallazgo: la rosa diminuta se inclina un poco con el scroll (y se balancea sola con CSS)
    3: (c, p) => {
      c.querySelector('.rosa-pequena').style.transform = `rotate(${(suave(p) - .5) * 7}deg)`;
    },
    // La noche: estrella fugaz que cruza el cielo casi en horizontal, con la estela alineada,
    // y la rosa que brilla un poco en su pata
    4: (c, p) => {
      const t = interv(p, .1, .62), vis = interv(p, .1, .18) * (1 - interv(p, .5, .62));
      const fugaz = c.querySelector('.estrella-fugaz');
      fugaz.style.opacity = vis.toFixed(3);
      fugaz.style.transform = `translate(${t * 4400}%,${t * 620}%)`;   // 8° de bajada, igual que la estela
      const brillo = c.querySelector('.brillo-rosa');
      brillo.style.opacity = (interv(p, .3, .7) * (.75 + .25 * Math.sin(p * 18))).toFixed(3);
    },
    // La puerta: gira sobre la bisagra, sale la luz de dentro y el ratón blanco se sonroja
    // Pausa sin texto: la luna baja hasta esconderse tras las colinas antes de que amanezca
    6: (c, p) => {
      const baja = suave(interv(p, 0, .55));
      c.querySelector('.luna').style.transform = `translate(${baja * 30}%,${baja * 500}%)`;
    },
    // Ya de madrugada: la puerta gira sobre su bisagra, sale la luz, aparece el ratón blanco y se sonroja
    7: (c, p) => {
      const abre = suave(interv(p, .04, .32));
      const rubor = suave(interv(p, .33, .47));
      const hoja = c.querySelector('.hoja-puerta');
      // gira hacia dentro sobre una bisagra metida en el hueco hasta quedar de canto,
      // oscureciéndose; al terminar de abrirse ya no se ve
      hoja.style.transform = `rotateY(${abre * -90}deg)`;
      hoja.style.filter = `brightness(${1 - abre * .6})`;
      hoja.style.opacity = (1 - interv(abre, .8, 1)).toFixed(3);
      c.querySelector('.luz-puerta').style.opacity = (abre * .5).toFixed(3);
      c.querySelector('.mejilla').style.opacity = (rubor * .85).toFixed(3);
    },
  };

  function medir() {
    posiciones.length = 0;
    pasajes.forEach((pasaje) => posiciones.push({
      inicio: pasaje.getBoundingClientRect().top + window.scrollY,
      alto: pasaje.offsetHeight,
    }));
  }

  function camara(escena, t) {
    const cuadro = escena.querySelector('.cuadro');
    if (!cuadro) return;
    const x = num(escena, 'x0') + (num(escena, 'x') - num(escena, 'x0')) * t;
    const y = num(escena, 'y0') + (num(escena, 'y') - num(escena, 'y0')) * t;
    const z = num(escena, 'z0') + (num(escena, 'z') - num(escena, 'z0')) * t;
    cuadro.style.transform = `translate(calc(-50% + ${x}%),calc(-50% + ${y}%)) scale(${1 + z})`;
    return cuadro;
  }

  function dibujar() {
    pendiente = false;
    const marcador = window.scrollY + window.innerHeight * .28;
    let actual = 0;
    for (let i = 0; i < posiciones.length; i++) if (marcador >= posiciones[i].inicio) actual = i;
    const etapa = posiciones[actual];
    const ultimo = actual === escenas.length - 1;
    // el último pasaje no puede bajar del todo (se acaba la página): su progreso llega a 1 al final del scroll
    const fin = ultimo ? Math.max(1, document.documentElement.scrollHeight - window.innerHeight + window.innerHeight * .28 - etapa.inicio) : etapa.alto;
    const progreso = limite((marcador - etapa.inicio) / fin);
    const desde = num(escenas[actual], 'mezcla', .8);   // dónde empieza el fundido a la siguiente
    const mezcla = ultimo ? 0 : suave(interv(progreso, desde, .98));

    escenas.forEach((escena, i) => {
      // la actual encima desvaneciéndose; la siguiente debajo, ya entera
      const visible = i === actual ? 1 - mezcla : (i === actual + 1 && mezcla > 0 ? 1 : 0);
      escena.style.opacity = String(visible);
      escena.style.zIndex = i === actual ? '2' : '1';
      escena.classList.toggle('activa', visible > 0);
      if (!visible) return;
      const t = i === actual ? interv(progreso, num(escena, 'camara', 0), 1) : 0;   // data-camara: la cámara espera hasta ahí
      const cuadro = camara(escena, suave(t));
      if (cuadro && efectos[i]) efectos[i](cuadro, i === actual ? progreso : 0);
    });

    pasajes.forEach((pasaje, i) => {
      const texto = pasaje.querySelector('.texto');
      if (i !== actual) { texto.style.opacity = '0'; return; }
      const e = num(pasaje, 'texto', .04);                // data-texto: el texto espera hasta ahí
      if (ultimo && texto.children && texto.children.length > 1) {
        // final: cada frase entra por separado, despacio, y se queda para leerla con calma
        texto.style.opacity = '1'; texto.style.transform = 'none';
        [...texto.children].forEach((frase, k) => {
          const a = e + k * .12, entra = suave(interv(progreso, a, a + .16));
          frase.style.opacity = entra.toFixed(3);
          frase.style.transform = `translateY(${(1 - entra) * 14}px)`;
        });
        return;
      }
      const entrada = i === 0 ? 1 : interv(progreso, e, e + .13);
      const salida = i === pasajes.length - 1 ? 1 : 1 - interv(progreso, .73, .9);
      texto.style.opacity = String(Math.min(entrada, salida));
      texto.style.transform = `translateY(${(1 - entrada) * 12}px)`;
    });
  }

  function actualizar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(dibujar);
  }
  function recalcular() { medir(); actualizar(); }

  document.documentElement.classList.add('js');
  medir(); dibujar();
  window.addEventListener('scroll', actualizar, {passive: true});
  window.addEventListener('resize', recalcular, {passive: true});
  window.addEventListener('load', recalcular, {once: true});
  if (document.fonts?.ready) document.fonts.ready.then(recalcular);
  reduce.addEventListener?.('change', () => window.location.reload());
})();
