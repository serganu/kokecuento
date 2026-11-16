/* Desplazamiento táctil y de ratón. La puerta incorpora una segunda capa para insinuar la reacción del ratón blanco. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return; // CSS coloca una ilustración estática en cada escena.

  const escenas = [...document.querySelectorAll('[data-lamina]')];
  const pasajes = [...document.querySelectorAll('[data-pasaje]')];
  if (escenas.length !== pasajes.length || !escenas.length) return;
  const limite = n => Math.max(0, Math.min(1, n));
  const interv = (x,a,b) => limite((x-a)/(b-a));
  const posiciones = [];
  let pendiente = false;

  function medir() {
    posiciones.length = 0;
    pasajes.forEach(pasaje => posiciones.push({
      inicio:pasaje.getBoundingClientRect().top + window.scrollY,
      alto:pasaje.offsetHeight
    }));
  }
  function dibujar() {
    pendiente=false;
    const marcador=window.scrollY+window.innerHeight*.28;
    let actual=0;
    for(let i=0;i<posiciones.length;i++) if(marcador>=posiciones[i].inicio) actual=i;
    const etapa=posiciones[actual];
    const progreso=limite((marcador-etapa.inicio)/etapa.alto);
    const mezcla=interv(progreso,.79,.98);

    escenas.forEach((escena,i) => {
      const visible=(i===actual)?1-mezcla:(i===actual+1?mezcla:0);
      escena.style.opacity=String(visible);
      escena.classList.toggle('activa',visible>0);
      if(!visible)return;
      const t=i===actual?progreso:0;
      const x=Number(escena.dataset.x||0)*t;
      const y=Number(escena.dataset.y||0)*t;
      const z=Number(escena.dataset.z||0)*t;
      const base=1;
      const marco=escena.querySelector('[data-escenario-puerta]');
      // Ilustración y elementos comparten el mismo rectángulo, con anclajes medidos
      // sobre la imagen fuente, no sobre la pantalla del usuario.
      const plano=escena.querySelector('.plano-ilustracion');
      if(plano){
        plano.style.transform=`translate3d(calc(-50% + ${x}%),calc(-50% + ${y}%),0) scale(${1+z})`;
        const hojas=plano.querySelectorAll('[data-hoja]');
        const rutas=[
          {x:28,y:43,dx:10,dy:35,inicio:.06,fin:.76,giro:125,escala:1},
          {x:84,y:56,dx:-15,dy:27,inicio:.20,fin:.88,giro:-148,escala:.83},
          {x:11,y:64,dx:17,dy:24,inicio:.33,fin:.93,giro:96,escala:.71},
          {x:92,y:65,dx:-13,dy:21,inicio:.46,fin:.98,giro:-93,escala:.64}
        ];
        hojas.forEach((hoja,n)=>{
          const r=rutas[n], t=interv(progreso,r.inicio,r.fin);
          const caida=(.17*t+.83*t*t);
          const deriva=Math.sin(t*Math.PI*2.2+n)*1.2;
          hoja.style.left=`${r.x+r.dx*t+deriva}%`;
          hoja.style.top=`${r.y+r.dy*caida}%`;
          hoja.style.transform=`translate(-50%,-50%) rotate(${(r.giro*t)+(n%2?12:-16)}deg) scale(${r.escala})`;
          hoja.style.opacity=String(interv(t,0,.14)*(1-interv(t,.88,1))*.83);
        });
        const rosa=plano.querySelector('.rosa-corola');
        if(rosa){
          const t=interv(progreso,.20,.76);
          const suave=t*t*(3-2*t);
          rosa.style.transform=`rotate(${(2.8*Math.sin(t*Math.PI)).toFixed(2)}deg) translateY(${(-.4*suave).toFixed(2)}%)`;
        }
        const fugaz=plano.querySelector('.estrella-fugaz');
        if(fugaz){
          const t=interv(progreso,.23,.69);
          fugaz.style.left=`${60-28*t}%`;
          fugaz.style.top=`${32+15*t}%`;
          fugaz.style.opacity=String(interv(t,0,.13)*(1-interv(t,.76,1))*.73);
        }
        return;
      }
      if(marco){
        // Movimiento de cámara (imagen, puerta y personaje comparten coordenadas).
        // Las piezas internas permanecen independientes del zoom general.
        marco.style.transform=`translate3d(calc(-50% + ${x}%),calc(-50% + ${y}%),0) scale(${base+z})`;
        const apertura=i===6?interv(progreso,.17,.57):1;
        const gesto=i===6?interv(progreso,.35,.70):1;
        const rojo=i===6?interv(progreso,.55,.88):1;
        const hoja=marco.querySelector('.hoja-puerta');
        const raton=marco.querySelector('.raton-blanco');
        const mejilla=marco.querySelector('.mejilla');
        hoja.style.transform=`perspective(600px) rotateY(${-apertura*78}deg)`;
        raton.style.opacity=String(gesto);
        raton.style.transform=`translate3d(0,${(1-gesto)*13}%,0) rotate(${(1-gesto)*3}deg)`;
        mejilla.style.opacity=String(rojo*.91);
      } else {
        const foto=escena.querySelector('img');
        if(!foto)return;
        const amplio=window.matchMedia('(min-aspect-ratio:4/3)').matches;
        foto.style.transform=amplio
          ? `translate3d(calc(-50% + ${x}%),${y}%,0) scale(${base+z})`
          : `translate3d(${x}%,${y}%,0) scale(${base+z})`;
      }
    });

    pasajes.forEach((pasaje,i) => {
      const texto=pasaje.querySelector('.texto');
      if(i!==actual){texto.style.opacity='0';return;}
      const entrada=i===0?1:interv(progreso,.04,.17);
      const salida=i===pasajes.length-1?1:1-interv(progreso,.73,.90);
      texto.style.opacity=String(Math.min(entrada,salida));
      texto.style.transform=`translateY(${(1-entrada)*12}px)`;
    });
  }
  function actualizar() {
    if(pendiente)return;
    pendiente=true;
    requestAnimationFrame(dibujar);
  }
  function recalcular() { medir();actualizar(); }
  document.documentElement.classList.add('js');
  medir();dibujar();
  window.addEventListener('scroll',actualizar,{passive:true});
  window.addEventListener('resize',recalcular,{passive:true});
  window.addEventListener('load',recalcular,{once:true});
  if(document.fonts?.ready)document.fonts.ready.then(recalcular);
  reduce.addEventListener?.('change',()=>window.location.reload());
})();