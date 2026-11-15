/* Efectos de "cuento que se abre". Se carga después de tienda.js.
   Si el visitante pide reducir animaciones, html no lleva la clase "anim" y aquí no se hace casi nada. */
(() => {
  const raiz = document.documentElement;
  const animado = raiz.classList.contains("anim");
  const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* Hilo de progreso de lectura */
  const hilo = document.createElement("div");
  hilo.className = "hilo";
  hilo.setAttribute("aria-hidden", "true");
  document.body.prepend(hilo);

  /* Tapa del libro: solo la primera vez de cada visita */
  if (raiz.classList.contains("abrir")) {
    raiz.style.setProperty("--espera", "1.7s");
    const tapa = document.getElementById("tapa");
    tapa?.addEventListener("animationend", () => { raiz.classList.remove("abrir"); });
    try { sessionStorage.setItem("kc-visto", "1"); } catch (e) { /* sin almacenamiento: se abre siempre */ }
  }

  /* Título de portada, palabra a palabra */
  const titulo = document.querySelector(".portada h1");
  if (titulo && animado) {
    titulo.setAttribute("aria-label", titulo.textContent);
    titulo.innerHTML = titulo.textContent.trim().split(/\s+/)
      .map((p, i) => `<span class="pal" aria-hidden="true" style="--i:${i}">${p}</span>`).join(" ");
  }

  /* Destellos de la portada: [izquierda %, arriba %, tamaño px, profundidad] */
  const marco = document.querySelector(".portada-imagen");
  if (marco) {
    [[6, 14, 22, 26], [88, 8, 30, 40], [96, 46, 18, 18], [2, 58, 16, 34], [78, 30, 14, 12], [18, 2, 14, 20], [60, -2, 18, 30]]
      .forEach(([x, y, s, f], i) => {
        const d = document.createElement("span");
        d.className = "destello"; d.textContent = "✦"; d.setAttribute("aria-hidden", "true");
        d.style.cssText = `left:${x}%;top:${y}%;font-size:${s}px;--f:${f};--t:${2.6 + (i % 4) * .7}s;--r:${-i * .6}s`;
        marco.append(d);
      });
    const portada = document.querySelector(".portada");
    portada.addEventListener("pointermove", (e) => {
      const r = portada.getBoundingClientRect();
      portada.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5) * 2);
      portada.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5) * 2);
    });
  }

  /* Secciones que se despliegan */
  const plegables = document.querySelectorAll("[data-pliega]");
  if (animado && "IntersectionObserver" in window) {
    const ojo = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visto"); ojo.unobserve(e.target); }
    }), { threshold: .15, rootMargin: "0px 0px -8% 0px" });
    plegables.forEach((el) => ojo.observe(el));
  } else plegables.forEach((el) => el.classList.add("visto"));

  /* Capítulo uno: la kokedama crece de Ratón a Lobo mientras se baja */
  const escena = document.getElementById("escena");
  let pintaEscena = () => {};
  if (escena && animado && typeof GAMAS !== "undefined") {
    const ids = Object.keys(GAMAS);
    const radios = [34, 44, 54];
    const fondos = ["#F6ECDF", "#FBE9D8", "#E9E8E4"];
    const paneles = document.getElementById("escena-paneles");
    const puntos = document.getElementById("escena-puntos");
    const koke = document.getElementById("escena-koke");
    const personaje = document.getElementById("escena-personaje");
    paneles.innerHTML = ids.map((id) => {
      const g = GAMAS[id];
      const desde = Math.min(...PRODUCTOS.filter((p) => p.gama === id).map((p) => p.precio));
      return `<div class="panel c-${id}"><span class="tam">${g.diametro}</span><h3>${g.nombre}</h3><p>${g.lema}</p>
        <p class="desde">Desde ${euros(desde)}</p><a class="boton secundario" href="#kokedamas" data-gama="${id}">Ver las de ${g.nombre}</a></div>`;
    }).join("");
    puntos.innerHTML = ids.map(() => `<span class="punto"></span>`).join("");
    const conImagenes = TIENDA.personajes && PLANTAS.rosa.imagen;
    if (conImagenes) {
      koke.innerHTML = `<img class="escena-planta" src="${PLANTAS.rosa.imagen}" alt="">`;
      personaje.innerHTML = ids.map((id) => `<img src="img/personajes/${id}.webp" alt="${GAMAS[id].nombre}" class="p-${id}">`).join("");
      personaje.hidden = false;
    }
    let ultimo = -1, ultimoR = 0;
    pintaEscena = () => {
      const r = escena.getBoundingClientRect();
      const p = limita(-r.top / (r.height - innerHeight));
      const s = p * (ids.length - 1) * 1.08;                 // un poco más para que el Lobo se asiente
      const i = Math.round(limita(s, 0, ids.length - 1));
      const a = Math.floor(limita(s, 0, ids.length - 1.001));
      const radio = radios[a] + (radios[a + 1] - radios[a]) * limita(s - a);
      if (conImagenes) koke.style.setProperty("--escala", (radio / radios[radios.length - 1]).toFixed(3));
      else if (Math.abs(radio - ultimoR) > .2 || i !== ultimo) {
        koke.innerHTML = ilustracion({ gama: ids[i], planta: "rosa" }, radio);
        ultimoR = radio;
      }
      if (i !== ultimo) {
        ultimo = i;
        escena.style.setProperty("--fondo", fondos[i]);
        [...paneles.children].forEach((el, n) => el.classList.toggle("activo", n === i));
        [...puntos.children].forEach((el, n) => el.classList.toggle("activo", n === i));
        if (conImagenes) [...personaje.children].forEach((el, n) => el.classList.toggle("activo", n === i));
      }
    };
  }

  /* Un solo bucle para todo lo que depende del scroll */
  let pendiente = false;
  const alBajar = () => {
    pendiente = false;
    const alto = raiz.scrollHeight - innerHeight;
    raiz.style.setProperty("--leido", alto > 0 ? limita(scrollY / alto) : 0);
    raiz.style.setProperty("--sy", Math.min(scrollY, 900));
    pintaEscena();
  };
  addEventListener("scroll", () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alBajar); } }, { passive: true });
  addEventListener("resize", alBajar);
  alBajar();

  /* Tarjetas: inclinación en 3D siguiendo al ratón */
  if (animado && matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", (e) => {
      const t = e.target.closest?.(".tarjeta");
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - .5) * 9}deg`);
      t.style.setProperty("--rx", `${((e.clientY - r.top) / r.height - .5) * -7}deg`);
    });
  }

  /* Botones: destello al pulsar */
  if (animado) {
    document.addEventListener("click", (e) => {
      const b = e.target.closest?.(".boton:not([aria-disabled='true'])");
      if (!b) return;
      for (let i = 0; i < 7; i++) {
        const c = document.createElement("span");
        const ang = (i / 7) * Math.PI * 2;
        c.className = "chispa"; c.textContent = "✦"; c.setAttribute("aria-hidden", "true");
        c.style.setProperty("--dx", `${Math.cos(ang) * 58}px`);
        c.style.setProperty("--dy", `${Math.sin(ang) * 40}px`);
        b.append(c);
        c.addEventListener("animationend", () => c.remove());
      }
    });
  }

  /* Ficha de producto: el cuento aparece frase a frase */
  const texto = document.querySelector(".cuento-caja p");
  if (texto && animado) {
    texto.innerHTML = texto.textContent.split(/(?<=[.!?»])\s+/)
      .map((f, i) => `<span class="frase" style="--i:${i}">${f}</span>`).join(" ");
  }
})();
