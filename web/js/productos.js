/* Datos de la tienda. Para cambiar precios, textos o añadir productos, edita solo este archivo.
   - enlacePago: pega aquí el enlace de pago de Stripe de cada producto. Mientras esté vacío,
     el botón de compra aparece como "Disponible muy pronto".
   - foto: ruta a la foto real (por ejemplo "img/productos/raton-rosa.jpg"). Mientras esté vacía,
     se muestra la ilustración de origami de su planta, más pequeña o más grande según la gama. */

const TIENDA = {
  nombre: "KokeCuento",
  envio: 5.9,               // € por pedido, península
  diasPreparacion: 2,
  instagram: "kokecuento",  // usuario sin @ (deja "" si aún no existe la cuenta)
  email: "",                // correo de contacto (deja "" para no mostrarlo)
  personajes: true,         // usa img/personajes/raton.webp, zorro.webp y lobo.webp en la escena de gamas
};

const GAMAS = {
  raton: { nombre: "Ratón", diametro: "8–10 cm", lema: "El detalle pequeño que llega lejos" },
  zorro: { nombre: "Zorro", diametro: "12–14 cm", lema: "El regalo que lo dice todo sin decir nada" },
  lobo:  { nombre: "Lobo",  diametro: "16–20 cm", lema: "El regalo grande, para quien se cuida de verdad" },
};

const PLANTAS = {
  rosa: {
    nombre: "Rosa pitiminí",
    imagen: "img/productos/rosa.webp",
    cuidados: [
      "Luz: mucha, junto a una ventana. Agradece algo de sol directo suave.",
      "Riego: sumerge la bola 10 minutos cuando pese poco, unas 2 veces por semana.",
      "Corta las flores marchitas para que salgan nuevas.",
    ],
    aviso: "",
  },
  pascua: {
    nombre: "Flor de Pascua",
    imagen: "img/productos/pascua.webp",
    cuidados: [
      "Luz: abundante, sin sol directo.",
      "Temperatura: entre 16 y 22 °C, lejos de radiadores y corrientes de aire.",
      "Riego: sumerge la bola 10 minutos cuando pese poco, más o menos una vez por semana.",
    ],
    aviso: "Su savia puede irritar la piel y es tóxica si se ingiere. Mantenla fuera del alcance de mascotas y niños pequeños.",
  },
  acebo: {
    nombre: "Acebo",
    imagen: "img/productos/acebo.webp",
    cuidados: [
      "Lugar: exterior o un sitio fresco y muy luminoso, como un balcón o una galería.",
      "Riego: mantén la bola siempre algo húmeda; sumérgela 10 minutos cuando pese poco.",
      "Aguanta bien el frío, pero no la calefacción.",
    ],
    aviso: "Las bayas son tóxicas si se ingieren. Mantenla fuera del alcance de mascotas y niños pequeños.",
  },
};

const PRODUCTOS = [
  { id: "raton-rosa", gama: "raton", planta: "rosa", precio: 19.9, enlacePago: "", foto: "",
    cuentoTitulo: "La rosa que cabía en una pata",
    cuento: "El ratón quería regalar una rosa, pero todas eran más grandes que él. Buscó por el jardín entero hasta dar con una tan pequeña que podía llevarla sin ayuda. La cargó de noche, despacio, y la dejó en una puerta sin llamar. Desde entonces se sabe que los regalos pequeños también llegan lejos. Solo hace falta alguien que los lleve." },
  { id: "raton-pascua", gama: "raton", planta: "pascua", precio: 18.9, enlacePago: "", foto: "",
    cuentoTitulo: "La estrella que se quedó en casa",
    cuento: "La noche más larga del invierno, el ratón vio caer una estrella roja en el bosque. Corrió a buscarla y, donde esperaba encontrar un fuego, encontró una flor. La envolvió en musgo para que no pasara frío y se la llevó a casa. Aquel invierno, en su madriguera, nunca hizo falta encender la luz." },
  { id: "raton-acebo", gama: "raton", planta: "acebo", precio: 21.9, enlacePago: "", foto: "",
    cuentoTitulo: "Las cuentas del invierno",
    cuento: "El ratón contaba el invierno con bayas de acebo: una por cada día de frío. No se las comía, porque sabía que no eran para eso. Las miraba. Cuando alguien le preguntaba cuánto faltaba para la primavera, él señalaba la rama y decía: «Menos que ayer». Y casi siempre acertaba." },
  { id: "zorro-rosa", gama: "zorro", planta: "rosa", precio: 29.9, enlacePago: "", foto: "",
    cuentoTitulo: "El zorro que no sabía decirlo",
    cuento: "El zorro era listo para casi todo, menos para decir lo que sentía. Ensayaba frases enteras y, al llegar el momento, hablaba del tiempo. Un día dejó de ensayar. Plantó una rosa en una bola de musgo, la dejó en la ventana de alguien y se fue sin decir nada. Dicen que nunca se ha explicado mejor." },
  { id: "zorro-pascua", gama: "zorro", planta: "pascua", precio: 28.9, enlacePago: "", foto: "",
    cuentoTitulo: "El abrigo rojo",
    cuento: "Cuando llegó el frío, las plantas del bosque se quedaron en verde y esperaron. Todas menos una, que le pidió consejo al zorro. «Si no puedes huir del invierno, vístete para recibirlo», le dijo él. A la mañana siguiente, la planta amaneció con las hojas más altas del color de su pelaje. Desde entonces, el invierno la saluda primero a ella." },
  { id: "zorro-acebo", gama: "zorro", planta: "acebo", precio: 32.9, enlacePago: "", foto: "",
    cuentoTitulo: "El guardián de la puerta",
    cuento: "El zorro buscaba un guardián para su madriguera. Probó con una piedra, pero no decía nada. Probó con un búho, pero se dormía de día. Al final plantó un acebo: hojas con pinchos para los que venían con prisa y bayas rojas para los que venían en son de paz. Nunca tuvo mejor portero, ni uno más elegante." },
  { id: "lobo-rosa", gama: "lobo", planta: "rosa", precio: 44.9, enlacePago: "", foto: "",
    cuentoTitulo: "El lobo que dejó de soplar",
    cuento: "En los cuentos dicen que el lobo sopla y derriba casas. Nadie cuenta que una vez encontró una rosa y dejó de soplar. Aprendió a caminar despacio a su alrededor, a darle agua sin ahogarla, a esperar. Tardó una primavera entera en verla florecer. Los que lo conocen dicen que, desde entonces, cuando respira hondo es solo para olerla." },
  { id: "lobo-pascua", gama: "lobo", planta: "pascua", precio: 42.9, enlacePago: "", foto: "",
    cuentoTitulo: "La hoguera que no se apaga",
    cuento: "El invierno en que nevó tres días seguidos, la manada se quedó sin leña. El lobo más viejo salió solo y volvió con una planta de hojas rojas entre los dientes. «No calienta», protestaron los jóvenes. «Miradla un rato», contestó. La pusieron en el centro y se sentaron alrededor. Nadie supo explicarlo, pero aquella noche nadie tuvo frío." },
  { id: "lobo-acebo", gama: "lobo", planta: "acebo", precio: 49.9, enlacePago: "", foto: "",
    cuentoTitulo: "La promesa verde",
    cuento: "Cuando el bosque pierde las hojas, el lobo recorre su territorio buscando algo que siga verde. Siempre lo encuentra en el mismo sitio: el acebo, que no se rinde en invierno y hasta se permite adornarse. El lobo se tumba a su lado y descansa tranquilo. Mientras algo siga verde, piensa, la primavera está de camino." },
];
