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

test('Portada, siete escenas y todos los recursos gráficos', () => {
 assert.equal((html.match(/data-pasaje="/g) || []).length, 8);
 assert.equal((html.match(/data-lamina="/g) || []).length, 8);
 for (const fname of ['00-portada.webp','01-rosas-gigantes.webp','02-busqueda.webp','03-hallazgo.webp','03-hallazgo-sin-corola.webp','rosa-corola.webp','hoja-papel-ancha.webp','hoja-papel-corta.webp','puerta-papel.webp','04-viaje-nocturno.webp','05-puerta.webp','05-puerta-fondo.webp','raton-blanco.webp','05-puerta-estatica.webp','06-amanecer-estatico.webp']) {
  assert.ok(html.includes('img/'+fname), fname);
  assert.ok(fs.statSync(path.join(root, 'img', fname)).size > 5000, fname);
 }
 assert.ok(html.indexOf('class="lamina lamina--entrega"') < html.indexOf('class="lamina lamina--puerta"'), 'la entrega del ratón marrón precede a la aparición del ratón blanco');
 assert.match(html, /class="pasaje pasaje--entrega"[\s\S]*?y la dejó en una puerta sin llamar\./);
 assert.ok(!html.includes('img/06-amanecer.webp'), 'sin ratón marrón en el desenlace');
});

test('Puerta, personaje y sonrojo son capas independientes', () => {
 assert.equal((html.match(/class="raton-blanco"/g) || []).length, 2);
 assert.equal((html.match(/class="hoja-puerta"/g) || []).length, 2);
 assert.equal((html.match(/class="mejilla"/g) || []).length, 2);
 assert.match(js, /interv\(progreso,\.17,\.57\)/);
 assert.ok(html.includes('data-lamina="6"'), 'apertura situada después de la entrega');
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
 const stages = Array.from({length:8}, (_,index) => index < 6 ? null : {
  style:{},
  nodes:{'.hoja-puerta':{style:{}},'.raton-blanco':{style:{}},'.mejilla':{style:{}}},
  querySelector(s){return this.nodes[s] || null}
 });
 const layers = Array.from({length:8}, (_,i) => ({
  style:{}, dataset:{x:'0',y:'-1',z:'.03'},
  classList:{toggle(){}},
  querySelectorAll(selector){return [];},
  querySelector(selector){
   if(selector === '[data-escenario-puerta]')return stages[i];
   if(selector === 'img' && i < 6)return {style:{}};
   return null;
  }
 }));
 const sections = Array.from({length:8}, (_,i) => ({
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
  stage:stages[6],final:stages[7],layers,
  moveTo(i,progress){scrollY=i*1200+progress*1200-280;scrollHandler();}
 };
}

test('La puerta se abre y el ratón aparece y se sonroja al hacer scroll; reversible', () => {
 const env=testDOM();
 env.moveTo(6,.01);
 assert.equal(env.stage.querySelector('.raton-blanco').style.opacity,'0');
 assert.equal(env.stage.querySelector('.hoja-puerta').style.transform,'perspective(600px) rotateY(0deg)');
 env.moveTo(6,.50);
 const apertura=env.stage.querySelector('.hoja-puerta').style.transform;
 assert.notEqual(apertura,'perspective(600px) rotateY(0deg)');
 assert.ok(Number(env.stage.querySelector('.raton-blanco').style.opacity)>0);
 env.moveTo(6,.95);
 assert.ok(Number(env.stage.querySelector('.mejilla').style.opacity)>.85);
 env.moveTo(6,.05);
 assert.equal(env.stage.querySelector('.mejilla').style.opacity,'0');
});


test('La entrega del ratón marrón es una escena independiente y el texto permanece original', () => {
 const stageBrown = html.indexOf('data-lamina="5"');
 const stageWhite = html.indexOf('data-lamina="6"');
 const textBrown = html.indexOf('data-pasaje="5"');
 const textWhite = html.indexOf('data-pasaje="6"');
 assert.ok(stageBrown >= 0 && stageBrown < stageWhite);
 assert.ok(textBrown >= 0 && textBrown < textWhite);
 assert.match(html.slice(stageBrown,stageWhite), /img\/05-puerta\.webp/);
 assert.ok(!html.slice(stageBrown,stageWhite).includes('raton-blanco'));
 assert.match(html.slice(textBrown,textWhite), /y la dejó en una puerta sin llamar\./);
 assert.match(html.slice(textWhite,html.indexOf('data-pasaje="7"')), /aria-hidden="true"><\/div>/);
});

test('Las piezas son del mismo papel y comparten el marco de coordenadas de la imagen', () => {
 assert.equal((html.match(/class="hoja-papel"/g)||[]).length,4);
 assert.equal((html.match(/class="plano-ilustracion"/g)||[]).length,3);
 assert.match(html,/class="rosa-corola" src="img\/rosa-corola.webp"/);
 assert.match(html,/class="estrella-fugaz"/);
 assert.match(html,/class="hoja-puerta" src="img\/puerta-papel.webp"/);
 assert.ok(!html.includes('class="destello-rosa"'));
 assert.ok(!html.includes('class="pulso-rosa"'));
 assert.ok(!css.includes('background:conic-gradient'));
 assert.match(js,/const plano=escena.querySelector\('\.plano-ilustracion'\)/);
 assert.match(js,/const rosa=plano.querySelector\('\.rosa-corola'\)/);
 assert.match(js,/const fugaz=plano.querySelector\('\.estrella-fugaz'\)/);
 assert.match(js,/rotateY\(/);
});

test('La estrella fugaz viaja por el cielo y la rosa se mueve sin alterar al ratón', () => {
 const originalStage=testDOM();
 const originalText=parts.join(' ');
 assert.equal(originalText,original);
 assert.match(js,/fugaz.style.left=`\$\{60-28\*t\}%`/);
 assert.match(js,/fugaz.style.top=`\$\{32\+15\*t\}%`/);
 assert.match(js,/rosa.style.transform=`rotate/);
 assert.ok(!html.includes('img/raton-original-modificado.webp'));
});