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
      // Hojas, descubrimiento de la rosa y estrella fugaz son piezas propias, no zooms del fondo.
      const hojas=escena.querySelectorAll('.hoja-viajera');
      hojas.forEach((hoja,idx) => {
        const entrada=interv(progreso,.08 + idx*.04,.28 + idx*.05);
        const salida=1-interv(progreso,.72 + idx*.02,.95);
        const vis=Math.max(0,Math.min(1,entrada*salida))*(.86-idx*.08);
        const offsetX=[-13,-8,-17,-10][idx] || -12;
        const offsetY=[6,-2,10,4][idx] || 5;
        const giro=[58,-42,77,33][idx] || 40;
        hoja.style.opacity=String(vis);
        hoja.style.transform=`translate3d(${offsetX*progreso}vw,${(-2 + progreso*offsetY*1.45)}vh,0) rotate(${(-18 + progreso*giro)}deg) scale(${1 + progreso*(.14 + idx*.02)})`;
      });
      const destello=escena.querySelector('.destello-rosa');
      const pulso=escena.querySelector('.pulso-rosa');
      if(destello && pulso){
        const hallazgo=interv(progreso,.18,.70);
        const desvanecer=1-interv(progreso,.80,.95);
        const vis=hallazgo*desvanecer;
        destello.style.opacity=String(vis*.95);
        destello.style.transform=`scale(${.72 + hallazgo*.42}) rotate(${hallazgo*20}deg)`;
        pulso.style.opacity=String(vis*.82);
        pulso.style.transform=`scale(${.55 + hallazgo*.9})`;
      }
      const fugaz=escena.querySelector('.estrella-fugaz');
      if(fugaz){
        const tiro=interv(progreso,.16,.70);
        const vis=tiro*(1-interv(progreso,.70,.90));
        fugaz.style.opacity=String(vis);
        fugaz.style.transform=`translate3d(${tiro*44}vw,${tiro*18}vh,0) rotate(16deg) scale(${.68 + tiro*.55})`;
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
        hoja.style.transform=`scaleX(${1-apertura*.88})`;
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