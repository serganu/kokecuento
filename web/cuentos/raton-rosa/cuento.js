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
    // El hallazgo: un destello sobre la rosa diminuta
    3: (c, p) => {
      const h = suave(interv(p, .15, .6)), vis = h * (1 - interv(p, .8, .95));
      c.querySelector('.destello-rosa').style.opacity = (vis * .95).toFixed(3);
      c.querySelector('.destello-rosa').style.transform = `scale(${.6 + h * .5}) rotate(${h * 25}deg)`;
      c.querySelector('.pulso-rosa').style.opacity = (vis * .9).toFixed(3);
      c.querySelector('.pulso-rosa').style.transform = `scale(${.5 + h})`;
    },
    // La noche: estrella fugaz y la rosa que brilla en su pata
    4: (c, p) => {
      const t = suave(interv(p, .12, .6)), vis = interv(p, .12, .2) * (1 - interv(p, .5, .62));
      const fugaz = c.querySelector('.estrella-fugaz');
      fugaz.style.opacity = vis.toFixed(3);
      fugaz.style.transform = `translate(${t * 4200}%,${t * 1700}%)`;
      const brillo = c.querySelector('.brillo-rosa');
      brillo.style.opacity = (interv(p, .3, .7) * (.75 + .25 * Math.sin(p * 18))).toFixed(3);
    },
    // La puerta: gira sobre la bisagra, sale la luz de dentro y el ratón blanco se sonroja
    6: (c, p) => {
      const abre = suave(interv(p, .12, .55));
      const rubor = suave(interv(p, .6, .85));
      const hoja = c.querySelector('.hoja-puerta');
      hoja.style.transform = `rotateY(${abre * -80}deg)`;
      hoja.style.filter = `brightness(${1 - abre * .5})`;
      hoja.style.opacity = String(abre > .97 ? 0 : 1);   // ya abierta, la de la lámina ocupa su sitio
      c.querySelector('.luz-puerta').style.opacity = (abre * .55).toFixed(3);
      c.querySelector('.mejilla').style.opacity = (rubor * .9).toFixed(3);
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
    const progreso = limite((marcador - etapa.inicio) / etapa.alto);
    const ultimo = actual === escenas.length - 1;
    const mezcla = ultimo ? 0 : suave(interv(progreso, .8, .98));

    escenas.forEach((escena, i) => {
      // la actual encima desvaneciéndose; la siguiente debajo, ya entera
      const visible = i === actual ? 1 - mezcla : (i === actual + 1 && mezcla > 0 ? 1 : 0);
      escena.style.opacity = String(visible);
      escena.style.zIndex = i === actual ? '2' : '1';
      escena.classList.toggle('activa', visible > 0);
      if (!visible) return;
      const t = i === actual ? progreso : 0;
      const cuadro = camara(escena, suave(t));
      if (cuadro && efectos[i]) efectos[i](cuadro, t);
    });

    pasajes.forEach((pasaje, i) => {
      const texto = pasaje.querySelector('.texto');
      if (i !== actual) { texto.style.opacity = '0'; return; }
      const entrada = i === 0 ? 1 : interv(progreso, .04, .17);
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
