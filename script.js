let letrasVistas = 0;

function voltear(card) {
  card.classList.toggle('volteada');

  if (!card.dataset.vista) {
    card.dataset.vista = 'si';
    letrasVistas++;
    document.querySelector('#contador').textContent = letrasVistas;
  }
}

function filtrar(tipo) {
  const cards = document.querySelectorAll('.card');

  cards.forEach(function (card) {
    if (tipo === 'todas' || card.dataset.tipo === 'vocal') {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  document.querySelectorAll('.filtros button').forEach(function (boton) {
    boton.classList.toggle('activo', boton.dataset.filtro === tipo);
  });
}

/* ---------- Estrellitas ✨ que aparecen y desaparecen ---------- */
document.querySelectorAll('[data-estrellas]').forEach(function (caja) {
  for (let i = 0; i < caja.dataset.estrellas; i++) {
    const estrella = document.createElement('span');
    estrella.className = 'estrella';
    estrella.textContent = '✨';
    estrella.style.left = Math.random() * 100 + '%';
    estrella.style.top = Math.random() * 100 + '%';
    estrella.style.setProperty('--s', 14 + Math.random() * 18 + 'px');
    estrella.style.setProperty('--d', 2 + Math.random() * 2.5 + 's');
    estrella.style.setProperty('--r', Math.random() * 4 + 's');
    caja.appendChild(estrella);
  }
});

/* ---------- Animación de texto: cada letra sube con un pequeño retraso ---------- */
function dividirTexto(el) {
  const texto = el.textContent.trim();
  const palabras = texto.split(' ');
  let contador = 0;

  el.textContent = '';
  el.setAttribute('aria-label', texto);

  palabras.forEach(function (palabra, i) {
    const spanPalabra = document.createElement('span');
    spanPalabra.className = 'palabra';
    spanPalabra.setAttribute('aria-hidden', 'true');

    for (const letra of palabra) {
      const spanLetra = document.createElement('span');
      spanLetra.className = 'letra-anim';
      spanLetra.textContent = letra;
      spanLetra.style.setProperty('--i', contador);
      contador++;
      spanPalabra.appendChild(spanLetra);
    }

    el.appendChild(spanPalabra);
    if (i < palabras.length - 1) {
      el.appendChild(document.createTextNode(' '));
    }
  });
}

const observador = new IntersectionObserver(
  function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('[data-anim]').forEach(function (el) {
  dividirTexto(el);
  observador.observe(el);
});

/* ---------- Práctica ---------- */
const TOTAL_TARJETAS = 5;
const GIROS = [8, 4, -3, -8, 5];
let tarjetas = [];
let actual = null;
let aciertos = 0;

function empezarPractica() {
  const mesa = document.querySelector('#mesa');
  const todas = Array.from(document.querySelectorAll('.card'));
  const elegidas = todas.sort(function () { return Math.random() - 0.5; }).slice(0, TOTAL_TARJETAS);

  mesa.innerHTML = '';
  tarjetas = [];
  actual = null;
  aciertos = 0;
  document.querySelector('#reto').classList.add('oculto');

  elegidas.forEach(function (card, i) {
    const carta = document.createElement('div');
    carta.className = 'carta';
    carta.dataset.letra = card.querySelector('h1').textContent;
    carta.dataset.palabra = card.querySelector('h3').textContent;
    carta.innerHTML = '<img src="' + card.querySelector('img').src + '" alt="' + carta.dataset.palabra + '">';

    carta.addEventListener('click', function () { elegirCarta(i); });
    carta.addEventListener('mouseenter', function () { acomodar(i); });
    carta.addEventListener('mouseleave', function () { acomodar(null); });

    mesa.appendChild(carta);
    tarjetas.push(carta);
  });

  // las cartas entran una por una, rebotando
  tarjetas.forEach(function (carta, i) {
    setTimeout(function () { acomodar(null); }, 100 + i * 120);
  });
}

// Coloca las cartas en abanico. Si el mouse está sobre una, esa sube y las demás se abren.
function acomodar(sobre) {
  const ancho = document.querySelector('#mesa').clientWidth;
  const separacion = Math.min(135, (ancho - 170) / (TOTAL_TARJETAS - 1));
  const centro = (TOTAL_TARJETAS - 1) / 2;

  tarjetas.forEach(function (carta, i) {
    let x = (i - centro) * separacion;
    let y = 0;
    let giro = GIROS[i];
    let escala = 1;

    if (sobre !== null && i === sobre) {
      y = -14;
      giro = 0;
      escala = 1.08;
    } else if (sobre !== null) {
      x += i > sobre ? 40 : -40;
    }

    carta.style.zIndex = i === sobre ? 10 : i;
    carta.style.transform =
      'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px) rotate(' + giro + 'deg) scale(' + escala + ')';
  });
}

function elegirCarta(i) {
  const carta = tarjetas[i];
  if (carta.classList.contains('lista')) return;

  tarjetas.forEach(function (c) { c.classList.remove('elegida'); });
  carta.classList.add('elegida');
  actual = carta;

  document.querySelector('#reto-imagen').src = carta.querySelector('img').src;
  document.querySelector('#reto-palabra').textContent = carta.dataset.palabra;
  document.querySelector('#reto-hueco').textContent = '_';
  document.querySelector('#reto-mensaje').textContent = 'Toca la letra con la que empieza.';
  armarOpciones(carta.dataset.letra);
  document.querySelector('#reto').classList.remove('oculto');
}

function armarOpciones(correcta) {
  const abecedario = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const opciones = [correcta];

  while (opciones.length < 4) {
    const letra = abecedario[Math.floor(Math.random() * abecedario.length)];
    if (!opciones.includes(letra)) opciones.push(letra);
  }
  opciones.sort(function () { return Math.random() - 0.5; });

  const caja = document.querySelector('#reto-opciones');
  caja.innerHTML = '';

  opciones.forEach(function (letra) {
    const boton = document.createElement('button');
    boton.textContent = letra;
    boton.addEventListener('click', function () { responder(letra, boton); });
    caja.appendChild(boton);
  });
}

function responder(letra, boton) {
  const mensaje = document.querySelector('#reto-mensaje');

  if (letra !== actual.dataset.letra) {
    boton.classList.remove('error');
    void boton.offsetWidth; // reinicia la animación de error
    boton.classList.add('error');
    mensaje.textContent = 'Casi... ¡intenta otra vez!';
    return;
  }

  boton.classList.add('correcta');
  document.querySelector('#reto-hueco').textContent = letra;
  document.querySelectorAll('#reto-opciones button').forEach(function (b) { b.disabled = true; });
  actual.classList.remove('elegida');
  actual.classList.add('lista');
  aciertos++;

  if (aciertos === TOTAL_TARJETAS) {
    mensaje.innerHTML = '🎉 ¡Completaste la práctica! <button onclick="empezarPractica()">Jugar otra vez</button>';
  } else {
    mensaje.textContent = '¡Muy bien! ' + letra + ' de ' + actual.dataset.palabra + ' ✨';
  }
}

/* ---------- Aparición suave de los elementos al bajar ---------- */
const observadorSuave = new IntersectionObserver(
  function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('entra');
        observadorSuave.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.revela').forEach(function (el, i) {
  if (el.classList.contains('card')) {
    el.style.setProperty('--retraso', (i % 5) * 0.08 + 's');
  }
  observadorSuave.observe(el);
});
