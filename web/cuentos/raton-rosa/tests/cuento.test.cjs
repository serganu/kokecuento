const {test} = require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'cuento.js'),'utf8');
const css=fs.readFileSync(path.join(root,'cuento.css'),'utf8');
const original='El ratón quería regalar una rosa, pero todas eran más grandes que él. Buscó por el jardín entero hasta dar con una tan pequeña que podía llevarla sin ayuda. La cargó de noche, despacio, y la dejó en una puerta sin llamar. Desde entonces se sabe que los regalos pequeños también llegan lejos. Solo hace falta alguien que los lleve.';
const parts=[
  'El ratón quería regalar una rosa, pero todas eran más grandes que él.',
  'Buscó por el jardín entero',
  'hasta dar con una tan pequeña que podía llevarla sin ayuda.',
  'La cargó de noche, despacio,',
  'y la dejó en una puerta sin llamar.',
  'Desde entonces se sabe que los regalos pequeños también llegan lejos.',
  'Solo hace falta alguien que los lleve.'
];
test('texto original del catálogo conservado, sin añadir ni omitir frases',()=>{
 assert.equal(parts.join(' '),original);
 for(const x of parts) assert.ok(html.includes(x),x);
});
test('portada y seis escenas, todas con una imagen existente',()=>{
 assert.equal((html.match(/data-pasaje="/g)||[]).length,7);
 assert.equal((html.match(/data-lamina="/g)||[]).length,7);
 for(let i=0;i<7;i++){
   const fname=fs.readdirSync(path.join(root,'img')).find(f=>f.startsWith(String(i).padStart(2,'0')+'-'));
   assert.ok(fname,'falta imagen de escena '+i);
   assert.ok(fs.statSync(path.join(root,'img',fname)).size>5000);
   assert.ok(html.includes('img/'+fname));
 }
});
test('sin barra, sonido ni activación automática',()=>{
 assert.ok(!html.includes('progress'));
 assert.ok(!html.includes('<audio'));
 assert.ok(!html.includes('<video'));
 assert.ok(!js.includes('setInterval'));
 assert.ok(js.includes('requestAnimationFrame'));
 assert.ok(js.includes('prefers-reduced-motion'));
 assert.ok(css.includes('prefers-reduced-motion'));
});