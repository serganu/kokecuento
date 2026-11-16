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
      // La hoja y el lucero son piezas propias, no zooms del fondo.
      const hoja=escena.querySelector('.hoja-viajera');
      if(hoja){
        hoja.style.opacity=String(interv(progreso,.12,.36)*(1-interv(progreso,.78,.95))*.85);
        hoja.style.transform=`translate3d(${-progreso*12}vw,${(progreso*.7-0.3)*9}vh,0) rotate(${progreso*55-16}deg)`;
      }
      const lucero=escena.querySelector('.estrella-movil');
      if(lucero)lucero.style.opacity=String(.18+interv(progreso,.12,.78)*.74);
      if(marco){
        // Movimiento de cámara (imagen, puerta y personaje comparten coordenadas).
        // Las piezas internas permanecen independientes del zoom general.
        marco.style.transform=`translate3d(calc(-50% + ${x}%),calc(-50% + ${y}%),0) scale(${base+z})`;
        const apertura=i===5?interv(progreso,.17,.57):1;
        const gesto=i===5?interv(progreso,.35,.70):1;
        const rojo=i===5?interv(progreso,.55,.88):1;
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