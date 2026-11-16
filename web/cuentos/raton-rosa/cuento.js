/* KokeCuento · Cuento ratón y rosa: desplazamiento reversible, sin librerías. */
(() => {
  "use strict";
  const raiz = document.documentElement;
  const secciones = Array.from(document.querySelectorAll("[data-pasaje]"));
  const laminas = Array.from(document.querySelectorAll("[data-lamina]"));
  const reduccion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (n) => Math.min(1, Math.max(0, n));
  if (secciones.length !== laminas.length) return;

  // El texto canónico siempre procede del catálogo existente; se conserva HTML de respaldo.
  try {
    const producto = typeof PRODUCTOS !== "undefined" &&
      PRODUCTOS.find((p) => p.id === "raton-rosa");
    if (producto) {
      const frases = (producto.cuento.match(/[^.!?]+[.!?]+/g) || []).map((f) => f.trim());
      if (frases.length === 5) {
        const busca = " hasta dar con ";
        const deja = " y la dejó ";
        const b = frases[1].indexOf(busca);
        const d = frases[2].indexOf(deja);
        if (b > 0 && d > 0) {
          const bloques = [
            frases[0],
            frases[1].slice(0, b),
            frases[1].slice(b + 1),
            frases[2].slice(0, d),
            frases[2].slice(d + 1),
            frases[3] + " " + frases[4]
          ];
          if (bloques.join(" ") === producto.cuento) {
            bloques.forEach((texto, i) => {
              const nodo = document.querySelector('[data-fragmento="' + i + '"]');
              if (nodo) nodo.textContent = texto;
            });
          } else {
            console.warn("KokeCuento: revisar la segmentación del texto original.");
          }
        }
      }
    }
  } catch (error) {
    console.warn("KokeCuento: el cuento se mostrará con el texto de respaldo.", error);
  }

  if (reduccion.matches) raiz.classList.add("reducido");
  else raiz.classList.add("con-js");
  const posiciones = [];
  const movimientos = laminas.map((lamina) => Array.from(
    lamina.querySelectorAll("[data-dx]")
  ).map((elemento) => ({
    elemento,
    dx: Number(elemento.dataset.dx || 0),
    dy: Number(elemento.dataset.dy || 0),
    zoom: Number(elemento.dataset.zoom || 0),
    rotate: Number(elemento.dataset.rotate || 0)
  })));

  function medir() {
    posiciones.length = 0;
    secciones.forEach((sec) => posiciones.push({
      inicio: sec.getBoundingClientRect().top + window.scrollY,
      alto: sec.offsetHeight
    }));
  }
  let pendiente = false;
  function render() {
    pendiente = false;
    const marcador = window.scrollY + window.innerHeight * .26;
    let indice = 0;
    for (let i = 0; i < posiciones.length; i++) {
      if (marcador >= posiciones[i].inicio) indice = i;
    }
    const etapa = posiciones[indice];
    const progreso = clamp((marcador - etapa.inicio) / etapa.alto);
    const reducido = reduccion.matches;
    const mezcla = reducido ? 0 : clamp((progreso - .79) / .21);

    laminas.forEach((lamina, i) => {
      const visible = i === indice ? 1 - mezcla :
        i === indice + 1 ? mezcla : 0;
      lamina.style.opacity = String(visible);
      lamina.classList.toggle("activa", visible > 0);
      // Movimiento reducido: cambiamos escenas sin animar las capas.
      if (visible === 0 || reducido) return;
      const t = i === indice ? progreso : 0;
      movimientos[i].forEach(({elemento,dx,dy,zoom,rotate}) => {
        elemento.style.transform =
          "translate3d(" + (dx * t).toFixed(2) + "vw," +
          (dy * t).toFixed(2) + "vh,0) rotate(" +
          (rotate * t).toFixed(2) + "deg) scale(" +
          (1 + zoom * t).toFixed(3) + ")";
      });
    });

    secciones.forEach((sec, i) => {
      const texto = sec.querySelector(".texto");
      if (!texto) return;
      if (reducido) {
        texto.style.opacity = "1";
        texto.style.transform = "none";
        return;
      }
      if (i !== indice) {
        texto.style.opacity = "0";
        return;
      }
      const entrada = indice === 0 ? 1 : clamp(progreso / .13);
      const salida = indice === secciones.length - 1 ? 1 :
        1 - clamp((progreso - .73) / .20);
      texto.style.opacity = String(Math.min(entrada, salida));
      const subir = indice === 0 ? 0 : 12 * (1 - entrada);
      texto.style.transform = "translate3d(0," + subir.toFixed(1) + "px,0)";
    });
  }

  function solicitar() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(render);
  }
  function recalcular() { medir(); solicitar(); }

  medir();
  render();
  window.addEventListener("scroll", solicitar, { passive:true });
  window.addEventListener("resize", recalcular, { passive:true });
  window.addEventListener("load", recalcular, { once:true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(recalcular);
  }
  // Si cambia la preferencia de accesibilidad, reiniciamos sin dejar estados intermedios.
  if (reduccion.addEventListener) {
    reduccion.addEventListener("change", () => window.location.reload());
  }
})();
