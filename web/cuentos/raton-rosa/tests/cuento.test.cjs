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

test('Portada, seis escenas y todos los recursos gráficos', () => {
 assert.equal((html.match(/data-pasaje="/g) || []).length, 7);
 assert.equal((html.match(/data-lamina="/g) || []).length, 7);
 for (const fname of ['00-portada.webp','01-rosas-gigantes.webp','02-busqueda.webp','03-hallazgo.webp','04-viaje-nocturno.webp','05-puerta-fondo.webp','raton-blanco.webp','05-puerta-estatica.webp','06-amanecer-estatico.webp']) {
  assert.ok(html.includes('img/'+fname), fname);
  assert.ok(fs.statSync(path.join(root, 'img', fname)).size > 5000, fname);
 }
 assert.ok(!html.includes('img/05-puerta.webp'), 'sin ratón marrón en la escena de la puerta');
 assert.ok(!html.includes('img/06-amanecer.webp'), 'sin ratón marrón en el desenlace');
});

test('Puerta, personaje y sonrojo son capas independientes', () => {
 assert.equal((html.match(/class="raton-blanco"/g) || []).length, 2);
 assert.equal((html.match(/class="hoja-puerta"/g) || []).length, 2);
 assert.equal((html.match(/class="mejilla"/g) || []).length, 2);
 assert.match(js, /interv\(progreso,\.17,\.57\)/);
 assert.match(js, /interv\(progreso,\.35,\.70\)/);
 assert.match(js, /interv\(progreso,\.55,\.88\)/);
 assert.match(js, /hoja\.style\.transform/);
 assert.match(js, /mejilla\.style\.opacity/);
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

function testDOM() {
 let scrollY = 0;
 let scrollHandler = null;
 const elements = (n) => Array.from({length:n}, () => ({style:{}}));
 const stages = Array.from({length:7}, (_,index) => index < 5 ? null : {
  style:{},
  nodes:{'.hoja-puerta':{style:{}},'.raton-blanco':{style:{}},'.mejilla':{style:{}}},
  querySelector(s){return this.nodes[s] || null}
 });
 const layers = Array.from({length:7}, (_,i) => ({
  style:{}, dataset:{x:'0',y:'-1',z:'.03'},
  classList:{toggle(){}},
  querySelector(selector){
   if(selector === '[data-escenario-puerta]')return stages[i];
   if(selector === 'img' && i < 5)return {style:{}};
   return null;
  }
 }));
 const sections = Array.from({length:7}, (_,i) => ({
  offsetHeight:1200,
  getBoundingClientRect(){return {top:i*1200-scrollY}},
  text:{style:{}},
  querySelector(s){return s === '.texto' ? this.text : null;}
 }));
 const win = {
  innerHeight:1000,
  get scrollY(){return scrollY;},
  matchMedia(){return {matches:false,addEventListener(){}}},
  addEventListener(t,fn){if(t==='scroll')scrollHandler=fn;},
  location:{reload(){}}
 };
 const doc = {
  documentElement:{classList:{add(){}}},
  querySelectorAll(s){return s==='[data-lamina]'?layers:s==='[data-pasaje]'?sections:[]},
  fonts:{ready:Promise.resolve()}
 };
 vm.runInNewContext(js,{window:win,document:doc, requestAnimationFrame(fn){fn();}}, {timeout:3000});
 return {
  stage:stages[5],final:stages[6],layers,
  moveTo(i,progress){scrollY=i*1200+progress*1200-280;scrollHandler();}
 };
}

test('La puerta se abre y el ratón aparece y se sonroja al hacer scroll; reversible', () => {
 const env=testDOM();
 env.moveTo(5,.01);
 assert.equal(env.stage.querySelector('.raton-blanco').style.opacity,'0');
 assert.equal(env.stage.querySelector('.hoja-puerta').style.transform,'scaleX(1)');
 env.moveTo(5,.50);
 const apertura=env.stage.querySelector('.hoja-puerta').style.transform;
 assert.notEqual(apertura,'scaleX(1)');
 assert.ok(Number(env.stage.querySelector('.raton-blanco').style.opacity)>0);
 env.moveTo(5,.95);
 assert.ok(Number(env.stage.querySelector('.mejilla').style.opacity)>.85);
 env.moveTo(5,.05);
 assert.equal(env.stage.querySelector('.mejilla').style.opacity,'0');
});