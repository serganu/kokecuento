/* Lógica de la tienda: pinta el catálogo y la ficha de producto a partir de productos.js */

const euros = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
const nombreDe = (p) => `${GAMAS[p.gama].nombre} · ${PLANTAS[p.planta].nombre}`;
const $ = (id) => document.getElementById(id);

/* Ilustración provisional de cada kokedama, hasta que haya fotos reales. */
function ilustracion(p, radio) {
  const r = radio ?? { raton: 34, zorro: 44, lobo: 54 }[p.gama];
  const cy = 150 - r, top = cy - r;
  const hoja = (x, y, rot, c, s = 1) =>
    `<path d="M0 0 C8 -10 22 -10 30 0 C22 10 8 10 0 0Z" fill="${c}" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"/>`;
  let planta = "";
  if (p.planta === "rosa") {
    planta = `<path d="M100 ${top + 4} L100 ${top - 42} M100 ${top - 14} L80 ${top - 30}" stroke="#4E6E2E" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${hoja(100, top - 8, -25, "#6F9A46")}${hoja(100, top - 22, 205, "#547E35", .8)}
      <path d="M86 ${top - 50} l14 -12 l14 12 l-4 16 h-20z" fill="#DD3A2D"/><path d="M100 ${top - 62} l14 12 l-14 6z" fill="#B42920"/>
      <path d="M71 ${top - 36} l9 -9 l9 9 l-3 11 h-12z" fill="#EE5A44"/>`;
  } else if (p.planta === "pascua") {
    const br = [0, 60, 120, 180, 240, 300].map((a) => hoja(100, top - 26, a, a % 120 ? "#C8312B" : "#DD3A2D", 1.05)).join("");
    planta = `<path d="M100 ${top + 4} L100 ${top - 26}" stroke="#4E6E2E" stroke-width="3" stroke-linecap="round"/>
      ${hoja(100, top - 4, -20, "#547E35", 1.1)}${hoja(100, top - 4, 200, "#6F9A46", 1.1)}${br}
      <circle cx="100" cy="${top - 26}" r="4" fill="#C9A24A"/>`;
  } else {
    const ac = (x, y, rot, c) => `<path d="M0 0 l6 -9 l5 5 l6 -8 l5 6 l7 -6 l3 12 l-3 12 l-7 -6 l-5 6 l-6 -8 l-5 5z" fill="${c}" transform="translate(${x} ${y}) rotate(${rot})"/>`;
    planta = `<path d="M100 ${top + 4} L100 ${top - 40}" stroke="#4E6E2E" stroke-width="3" stroke-linecap="round"/>
      ${ac(100, top - 12, -30, "#3F6B2B")}${ac(100, top - 18, 210, "#5A8A3C")}${ac(100, top - 38, -80, "#5A8A3C")}
      <circle cx="96" cy="${top - 6}" r="5" fill="#C8312B"/><circle cx="106" cy="${top - 9}" r="5" fill="#DD3A2D"/><circle cx="101" cy="${top - 15}" r="4.5" fill="#C8312B"/>`;
  }
  return `<svg viewBox="-15 -34 230 230" role="img" aria-label="Ilustración de ${nombreDe(p)}" width="100%" height="100%">
    <ellipse cx="100" cy="158" rx="${r + 26}" ry="9" fill="#D8C3A5"/><ellipse cx="100" cy="155" rx="${r + 26}" ry="9" fill="#EADBC5"/>
    <circle cx="100" cy="${cy}" r="${r}" fill="#6F8F3F"/>
    <path d="M${100 - r} ${cy - 4} Q100 ${cy + r * .5} ${100 + r} ${cy - 4}" stroke="#C9A57B" stroke-width="2" fill="none"/>
    <path d="M${100 - r * .9} ${cy + r * .4} Q100 ${cy - r * .3} ${100 + r * .9} ${cy + r * .4}" stroke="#C9A57B" stroke-width="2" fill="none"/>
    <g transform="translate(100 ${top}) scale(${(r / 40).toFixed(3)}) translate(-100 ${-top})">${planta}</g></svg>`;
}

/* Foto real si existe; si no, la ilustración de origami de la planta (a escala de su gama); si no, el dibujo. */
const imagen = (p) => {
  if (p.foto) return `<img src="${p.foto}" alt="${nombreDe(p)}" loading="lazy">`;
  const dibujo = PLANTAS[p.planta].imagen;
  return dibujo ? `<img class="origami o-${p.gama}" src="${dibujo}" alt="Ilustración de ${nombreDe(p)}" loading="lazy">` : ilustracion(p);
};

function ponDatosTienda() {
  document.querySelectorAll("[data-dias]").forEach((e) => (e.textContent = TIENDA.diasPreparacion));
  document.querySelectorAll("[data-envio]").forEach((e) => (e.textContent = euros(TIENDA.envio)));
  const c = $("contacto");
  if (!c) return;
  const partes = [];
  if (TIENDA.instagram) partes.push(`<p>Instagram: <a href="https://www.instagram.com/${TIENDA.instagram}/" rel="noopener">@${TIENDA.instagram}</a></p>`);
  if (TIENDA.email) partes.push(`<p>Escríbenos: ${TIENDA.email}</p>`);
  c.innerHTML = partes.join("");
}

/* ---------- Página de inicio ---------- */
function inicio() {
  $("lista-gamas").innerHTML = Object.entries(GAMAS).map(([id, g]) => {
    const desde = Math.min(...PRODUCTOS.filter((p) => p.gama === id).map((p) => p.precio));
    return `<a class="gama c-${id}" href="#kokedamas" data-gama="${id}">
      <span class="tam">${g.diametro}</span><h3>${g.nombre}</h3><p>${g.lema}</p><p class="desde">Desde ${euros(desde)}</p></a>`;
  }).join("");

  const filtros = [["todas", "Todas"], ...Object.entries(GAMAS).map(([id, g]) => [id, g.nombre])];
  $("filtros").innerHTML = filtros.map(([id, t]) => `<button class="filtro" type="button" data-gama="${id}" aria-pressed="${id === "todas"}">${t}</button>`).join("");

  function pinta(gama) {
    const lista = PRODUCTOS.filter((p) => gama === "todas" || p.gama === gama);
    $("rejilla").innerHTML = lista.map((p, i) => `<a class="tarjeta c-${p.gama}" href="producto.html?id=${p.id}" style="--i:${i}">
      <div class="libro"><div class="pagina" aria-hidden="true"><span class="etiqueta">Su cuento</span><span>${p.cuento.slice(0, 96).replace(/\s+\S*$/, "")}…</span></div>
      <div class="foto">${imagen(p)}</div></div>
      <div class="info"><span class="chip">${GAMAS[p.gama].nombre} · ${GAMAS[p.gama].diametro}</span>
      <h3>${PLANTAS[p.planta].nombre}</h3><p class="cuento-titulo">«${p.cuentoTitulo}»</p><p class="precio">${euros(p.precio)}</p></div></a>`).join("");
    document.querySelectorAll(".filtro").forEach((b) => b.setAttribute("aria-pressed", b.dataset.gama === gama));
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-gama]");
    if (el) pinta(el.dataset.gama);
  });
  pinta("todas");

  const m = PRODUCTOS.find((p) => p.id === "zorro-rosa") || PRODUCTOS[0];
  $("muestra-titulo").textContent = m.cuentoTitulo;
  $("muestra-texto").textContent = m.cuento;
  $("muestra-cita").innerHTML = `El cuento de <a href="producto.html?id=${m.id}">${nombreDe(m)}</a>`;
}

/* ---------- Página de producto ---------- */
function producto() {
  const id = new URLSearchParams(location.search).get("id");
  const p = PRODUCTOS.find((x) => x.id === id);
  const caja = $("producto");
  if (!p) {
    caja.innerHTML = `<div class="ficha"><h1>No encontramos esa kokedama</h1><p>Puede que el enlace esté incompleto.</p><p><a class="boton" href="index.html#kokedamas">Ver todas las kokedamas</a></p></div>`;
    return;
  }
  const g = GAMAS[p.gama], pl = PLANTAS[p.planta];
  document.title = `${nombreDe(p)} · KokeCuento`;
  $("miga").textContent = nombreDe(p);
  const comprar = p.enlacePago
    ? `<a class="boton" href="${p.enlacePago}" rel="noopener">Comprar · ${euros(p.precio)}</a>`
    : `<span class="boton" aria-disabled="true">Disponible muy pronto</span>`;
  caja.innerHTML = `
    <div class="foto">${imagen(p)}</div>
    <div class="ficha c-${p.gama}">
      <span class="chip">Gama ${g.nombre}</span>
      <h1>${pl.nombre}</h1>
      <p class="precio">${euros(p.precio)}</p>
      <div>${comprar}</div>
      <p class="nota">IVA incluido · Envío ${euros(TIENDA.envio)} a la península · Se prepara en ${TIENDA.diasPreparacion} días</p>
      <div class="cuento-caja"><span class="etiqueta">Su cuento</span><h2>${p.cuentoTitulo}</h2><p>${p.cuento}</p></div>
      <div data-pliega><h3>Qué incluye</h3>
        <dl class="datos"><dt>Bola de musgo</dt><dd>${g.diametro} de diámetro, hecha a mano</dd>
        <dt>Presentación</dt><dd>Base y plato</dd><dt>Tarjeta</dt><dd>Con el cuento y la guía de cuidados</dd></dl></div>
      <div data-pliega><h3>Cuidados</h3><ul>${pl.cuidados.map((c) => `<li>${c}</li>`).join("")}</ul></div>
      ${pl.aviso ? `<p class="aviso">${pl.aviso}</p>` : ""}
    </div>
    <div class="compra-fija"><strong>${euros(p.precio)}</strong>${comprar}</div>`;
  document.body.classList.add("con-compra");
  const otras = PRODUCTOS.filter((x) => x.id !== p.id && (x.gama === p.gama || x.planta === p.planta)).slice(0, 4);
  $("rejilla").innerHTML = otras.map((o, i) => `<a class="tarjeta c-${o.gama}" href="producto.html?id=${o.id}" style="--i:${i}">
    <div class="libro"><div class="pagina" aria-hidden="true"><span class="etiqueta">Su cuento</span><span>${o.cuento.slice(0, 96).replace(/\s+\S*$/, "")}…</span></div>
    <div class="foto">${imagen(o)}</div></div><div class="info"><span class="chip">${GAMAS[o.gama].nombre} · ${GAMAS[o.gama].diametro}</span>
    <h3>${PLANTAS[o.planta].nombre}</h3><p class="precio">${euros(o.precio)}</p></div></a>`).join("");
}

ponDatosTienda();
if ($("lista-gamas")) inicio();
if ($("producto")) producto();
