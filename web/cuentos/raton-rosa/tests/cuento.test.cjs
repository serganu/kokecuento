const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'cuento.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'cuento.css'), 'utf8');
const original = 'El ratón quería regalar una rosa, pero todas eran más grandes que él. Buscó por el jardín entero hasta dar con una tan pequeña que podía llevarla sin ayuda. La cargó de noche, despacio, y la dejó en una puerta sin llamar. Desde entonces se sabe que los regalos pequeños también llegan lejos. Solo hace falta alguien que los lleve.';
const parts = [
 'El ratón quería regalar una rosa, pero todas eran más grandes que él.',
 'Buscó por el jardín entero',
 'hasta dar con una tan pequeña que podía llevarla sin ayuda.',
 'La cargó de noche, despacio,',
 'y la dejó en una puerta sin llamar.',
 'Desde entonces se sabe que los regalos pequeños también llegan lejos.',
 'Solo hace falta alguien que los lleve.'
];

test('Texto original intacto y sin frases añadidas', () => {
 assert.equal(parts.join(' '), original);
 for (const part of parts) assert.ok(html.includes(part), part);
});

test('Portada, siete escenas y todas las imágenes existen', () => {
 assert.equal((html.match(/data-pasaje="/g) || []).length, 8);
 assert.equal((html.match(/data-lamina="/g) || []).length, 8);
 const usadas = new Set([...html.matchAll(/img\/[\w.-]+\.webp/g), ...css.matchAll(/img\/[\w.-]+\.webp/g)].map((m) => m[0]));
 assert.ok(usadas.size >= 9);
 for (const ruta of usadas) assert.ok(fs.existsSync(path.join(root, ruta)) && fs.statSync(path.join(root, ruta)).size > 5000, 'falta ' + ruta);
 assert.ok(html.indexOf('class="lamina lamina--entrega"') < html.indexOf('class="lamina lamina--puerta"'), 'la entrega del ratón marrón precede a la aparición del ratón blanco');
 assert.match(html, /class="pasaje pasaje--entrega"[\s\S]*?y la dejó en una puerta sin llamar\./);
});

test('Cada lámina tiene un cuadro y las piezas animadas van dentro de él', () => {
 const laminas = html.split('data-lamina="').slice(1);
 for (const l of laminas) assert.match(l, /class="cuadro/);
 for (const pieza of ['hoja-viajera','destello-rosa','pulso-rosa','estrella-fugaz','hoja-puerta','mejilla','luz-puerta'])
  assert.match(html, new RegExp('class="[^"]*' + pieza));
});

test('Sin controles de progreso, sonido o reproducción automática', () => {
 assert.ok(!html.includes('<progress'));
 assert.ok(!html.includes('<audio'));
 assert.ok(!html.includes('<video'));
 assert.ok(!js.includes('setInterval'));
 assert.ok(js.includes('requestAnimationFrame'));
 assert.ok(js.includes('prefers-reduced-motion'));
 assert.ok(css.includes('prefers-reduced-motion'));
});

/* DOM mínimo para ejecutar cuento.js sin navegador */
function testDOM() {
 let scrollY = 0, scrollHandler = null;
 const nodo = () => ({style:{}});
 const ids = [...html.matchAll(/data-lamina="(\d+)"/g)].map((m) => +m[1]);
 const layers = ids.map((i) => {
  const piezas = {}; const varias = {};
  ['.hoja-puerta','.mejilla','.luz-puerta','.destello-rosa','.pulso-rosa','.estrella-fugaz','.brillo-rosa'].forEach((s) => piezas[s] = nodo());
  varias['.hoja-viajera'] = [nodo(), nodo(), nodo(), nodo()];
  const cuadro = {style:{}, querySelector:(s) => piezas[s] || null, querySelectorAll:(s) => varias[s] || []};
  return {style:{}, dataset:{}, classList:{toggle(){}}, cuadro, piezas,
   querySelector:(s) => s === '.cuadro' ? cuadro : null};
 });
 const sections = ids.map((i) => ({offsetHeight:1200, text:{style:{}},
  getBoundingClientRect(){return {top:i*1200-scrollY}}, querySelector(s){return s === '.texto' ? this.text : null}}));
 const win = {innerHeight:1000, get scrollY(){return scrollY}, matchMedia(){return {matches:false,addEventListener(){}}},
  addEventListener(t,fn){if(t==='scroll')scrollHandler=fn}, location:{reload(){}}};
 const doc = {documentElement:{classList:{add(){}}}, fonts:{ready:Promise.resolve()},
  querySelectorAll(s){return s==='[data-lamina]'?layers:s==='[data-pasaje]'?sections:[]}};
 vm.runInNewContext(js, {window:win, document:doc, requestAnimationFrame(fn){fn()}}, {timeout:3000});
 return {layers, moveTo(i,p){scrollY=i*1200+p*1200-280; scrollHandler()}};
}

test('La puerta gira, sale la luz y el ratón blanco se sonroja al bajar; al subir se deshace', () => {
 const env = testDOM(), puerta = env.layers[6].piezas;
 env.moveTo(6,.02);
 assert.equal(puerta['.hoja-puerta'].style.transform, 'rotateY(0deg)');
 assert.equal(Number(puerta['.mejilla'].style.opacity), 0);
 env.moveTo(6,.4);
 assert.ok(Number(puerta['.hoja-puerta'].style.transform.match(/-?[\d.]+/)[0]) < -30, 'la puerta ya está girando');
 assert.ok(Number(puerta['.luz-puerta'].style.opacity) > .2);
 env.moveTo(6,.95);
 assert.ok(Number(puerta['.mejilla'].style.opacity) > .85);
 env.moveTo(6,.05);
 assert.equal(Number(puerta['.mejilla'].style.opacity), 0);
});

test('Entre escenas la nueva queda debajo entera y la anterior se desvanece encima', () => {
 const env = testDOM();
 env.moveTo(2,.9);
 const [a,b] = [env.layers[2].style, env.layers[3].style];
 assert.equal(b.opacity, '1');
 assert.ok(Number(a.opacity) > 0 && Number(a.opacity) < 1);
 assert.ok(Number(a.zIndex) > Number(b.zIndex));
});

test('La cámara de la casa continúa sin saltos entre entrega, puerta y desenlace', () => {
 const z = (n) => html.match(new RegExp('data-lamina="' + n + '"[^>]*'))[0];
 const fin5 = z(5).match(/data-z="([\d.]+)"/)[1], ini6 = z(6).match(/data-z0="([\d.]+)"/)[1];
 const fin6 = z(6).match(/data-z="([\d.]+)"/)[1], ini7 = z(7).match(/data-z0="([\d.]+)"/)[1];
 assert.equal(fin5, ini6); assert.equal(fin6, ini7);
});

test('Hojas, destello de la rosa y estrella fugaz se mueven con el scroll', () => {
 const env = testDOM();
 env.moveTo(2,.5); assert.ok(Number(env.layers[2].cuadro.querySelectorAll('.hoja-viajera')[0].style.opacity) > 0);
 env.moveTo(3,.5); assert.ok(Number(env.layers[3].piezas['.destello-rosa'].style.opacity) > 0);
 env.moveTo(4,.35); assert.ok(Number(env.layers[4].piezas['.estrella-fugaz'].style.opacity) > 0);
});
