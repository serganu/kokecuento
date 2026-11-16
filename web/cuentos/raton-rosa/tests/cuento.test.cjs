/* Tests de lógica sin navegador, Node.js estándar. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");
const { resolve } = require("node:path");

const dir = resolve(__dirname, "..");
const codigo = readFileSync(resolve(dir, "cuento.js"), "utf8");
const catalogo = readFileSync(resolve(dir, "..", "..", "js", "productos.js"), "utf8");
const producto = runInNewContext(catalogo + "\nPRODUCTOS.find(p => p.id === 'raton-rosa')");

function montar(reducido = false) {
  let scrollY = 0;
  const ventanas = {};
  const secciones = Array.from({length:7}, (_,i) => {
    const texto = {style:{}};
    return {
      offsetHeight:1400,
      getBoundingClientRect(){ return {top:i*1400-scrollY}; },
      querySelector(sel){return sel===".texto"?texto:null;},
      texto
    };
  });
  const laminas = Array.from({length:7}, () => {
    const classSet = new Set();
    return {
      style:{},
      classList:{toggle(k,v){if(v)classSet.add(k);else classSet.delete(k);},contains(k){return classSet.has(k);}},
      elemento:{style:{},dataset:{dx:"12",dy:"0",zoom:"0.1",rotate:"0"}},
      querySelectorAll(){return [this.elemento];}
    };
  });
  const fragmentos = Array.from({length:6},()=>({textContent:""}));
  const htmlClasses = new Set();
  const doc = {
    documentElement:{classList:{add(k){htmlClasses.add(k);}}},
    querySelectorAll(sel){return sel==="[data-pasaje]"?secciones:sel==="[data-lamina]"?laminas:[];},
    querySelector(sel){const m=/data-fragmento="(\d+)"/.exec(sel);return m?fragmentos[Number(m[1])]:null;}
  };
  const media = {matches:reducido,addEventListener(){}};
  const win = {
    innerHeight:1000,
    get scrollY(){return scrollY;},
    matchMedia(){return media;},
    requestAnimationFrame(callback){callback();},
    addEventListener(name,handler){ventanas[name]=handler;},
    location:{reload(){}}
  };
  runInNewContext(codigo,{window:win,document:doc,PRODUCTOS:[producto],console},{timeout:2000});
  return {
    secciones,laminas,fragmentos,htmlClasses,
    mover(y){scrollY=y;ventanas.scroll();}
  };
}

test("Respeta todo el texto original y su orden", () => {
  const s=montar();
  assert.equal(s.fragmentos.map(f=>f.textContent).join(" "),producto.cuento);
});

test("Portada, transición y escenas reaccionan al scroll reversible", () => {
  const s=montar();
  assert.equal(s.laminas[0].style.opacity,"1");
  assert.equal(s.laminas[1].style.opacity,"0");
  s.mover(1100);
  const a=Number(s.laminas[0].style.opacity);
  assert.ok(a>0 && a<1);
  assert.ok(Number(s.laminas[1].style.opacity)>0);
  s.mover(1500);
  assert.equal(s.laminas[1].style.opacity,"1");
  assert.equal(s.laminas[1].classList.contains("activa"),true);
  assert.ok(s.laminas[1].elemento.style.transform.includes("translate3d"));
  s.mover(0);
  assert.equal(s.laminas[0].style.opacity,"1");
  assert.equal(s.laminas[1].style.opacity,"0");
});

test("Movimiento reducido: escenas sin transformaciones ni texto oculto", () => {
  const s=montar(true);
  assert.equal(s.htmlClasses.has("reducido"),true);
  assert.equal(s.laminas[0].style.opacity,"1");
  s.mover(1500);
  assert.equal(s.laminas[0].style.opacity,"0");
  assert.equal(s.laminas[1].style.opacity,"1");
  assert.equal(s.laminas[1].elemento.style.transform,undefined);
  assert.equal(s.secciones[1].texto.style.opacity,"1");
});
