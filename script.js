const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configuración del canvas
canvas.width = 800;
canvas.height = 600;

// Cargar imágenes
const mouthOpenImg = new Image();
mouthOpenImg.src = "cris.png"; // Imagen de la boca abierta

const mouthClosedImg = new Image();
mouthClosedImg.src = "cerrada.png"; // Imagen de la boca cerrada

const pancakeImg = new Image();
pancakeImg.src = "tortita.png"; // Imagen de la tortita

// Variables del juego
let mouth = { x: 300, y: 450, width: 150, height: 150, speed: 5 }; // Aumentamos el tamaño de la boca
let pancakes = [];
let score = 0;
let isPaused = false;
let mouthOpen = true; // Controla si la boca está abierta o cerrada
let mouthToggleCounter = 0; // Contador para alternar la imagen

// Tiempo
let startTime = Date.now(); // Tiempo inicial
let elapsedTime = 0; // Tiempo transcurrido

// Controles de movimiento
let keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "p" || e.key === "P") togglePause(); // Pausar con la tecla "P"
});
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// Función para pausar/reanudar
function togglePause() {
  isPaused = !isPaused;
  if (!isPaused) {
    startTime = Date.now() - elapsedTime; // Ajustar el tiempo al reanudar
    gameLoop();
  }
}

// Crear una tortita
function spawnPancake() {
  if (!isPaused) {
    pancakes.push({
      x: Math.random() * (canvas.width - 50),
      y: 0,
      width: 50,
      height: 50,
      speed: 3,
      target: false,
    });
  }
}
setInterval(spawnPancake, 1000);

// Alternar entre boca abierta y cerrada
function toggleMouth() {
  mouthToggleCounter++;
  if (mouthToggleCounter % 20 === 0) {
    mouthOpen = !mouthOpen; // Cambia el estado de la boca cada 20 cuadros
  }
}

// Bucle principal del juego
function gameLoop() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Alternar la boca abierta/cerrada
  toggleMouth();

  // Dibujar la boca
  const currentMouthImg = mouthOpen ? mouthOpenImg : mouthClosedImg;
  if (keys["ArrowLeft"] && mouth.x > 0) mouth.x -= mouth.speed;
  if (keys["ArrowRight"] && mouth.x + mouth.width < canvas.width) mouth.x += mouth.speed;
  ctx.drawImage(currentMouthImg, mouth.x, mouth.y, mouth.width, mouth.height);

  // Dibujar y actualizar las tortitas
  for (let i = pancakes.length - 1; i >= 0; i--) {
    const pancake = pancakes[i];

    if (pancake.target) {
      // Mover la tortita hacia la boca
      pancake.x += (mouth.x + mouth.width / 2 - pancake.x) * 0.1;
      pancake.y += (mouth.y + mouth.height / 2 - pancake.y) * 0.1;

      // Comprobar si la tortita alcanza la boca
      if (
        Math.abs(pancake.x - (mouth.x + mouth.width / 2)) < 5 &&
        Math.abs(pancake.y - (mouth.y + mouth.height / 2)) < 5
      ) {
        pancakes.splice(i, 1); // Eliminar la tortita
        score++; // Incrementar la puntuación
      }
    } else {
      // Movimiento normal de caída
      pancake.y += pancake.speed;

      // Comprobar colisión con la imagen
      if (
        pancake.x < mouth.x + mouth.width &&
        pancake.x + pancake.width > mouth.x &&
        pancake.y < mouth.y + mouth.height &&
        pancake.y + pancake.height > mouth.y
      ) {
        pancake.target = true; // Dirigirse a la boca
      }

      // Eliminar tortitas que salen de la pantalla
      if (pancake.y > canvas.height) pancakes.splice(i, 1);
    }

    ctx.drawImage(pancakeImg, pancake.x, pancake.y, pancake.width, pancake.height);
  }

  // Calcular tiempo transcurrido
  elapsedTime = Date.now() - startTime;

  // Mostrar puntuación
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(`Score: ${score}`, 10, 30);

  // Mostrar tiempo
  const seconds = Math.floor(elapsedTime / 1000);
  ctx.fillText(`Time: ${seconds}s`, 10, 60);

  // Mostrar mensaje de pausa
  if (isPaused) {
    ctx.font = "40px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("PAUSED", canvas.width / 2 - 80, canvas.height / 2);
    return;
  }

  requestAnimationFrame(gameLoop);
}

// Asegurarse de que las imágenes se carguen antes de iniciar el juego
let imagesLoaded = 0;
function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 3) gameLoop();
}
mouthOpenImg.onload = checkImagesLoaded;
mouthClosedImg.onload = checkImagesLoaded;
pancakeImg.onload = checkImagesLoaded;
