/* Globals
--------------------*/
var audioContext, audioEnabled, gameCanvas, gameContext;
var backgroundSoft;
var rocketX = 512, rocketY = 588;

/* Load Images
--------------------*/
var rocket = new Image();
rocket.src = 'sxrimg/rocket.png';
var flame = new Image();
flame.src = 'sxrimg/flame.png';


/* Initialize
--------------------*/
window.addEventListener('DOMContentLoaded', function() { init(); });

function init() {
  // Set up audio
  initAudio();
  loadAudio();
  
  // Splash screen
  splash();
  
  // Load game
  initGame();
}

function initAudio() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    audioContext = new AudioContext();
    audioEnabled = true;
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
}

function loadAudio() {
  // Soft
  getSound('sounds/soft.ogg', function (sound) { backgroundSoft = sound; });
}

function initGame() {
  // Select Game Canvas and Context
  gameCanvas = document.getElementById("game");
  if (gameCanvas.getContext){
    gameContext = gameCanvas.getContext('2d');
  } else {
    alert('Canvas is unsupported :(  To play, please download a browser that supports the canvas element (like Firefox).');
    return;
  }
  gameContext.mozImageSmoothingEnabled = false;
  
  setTimeout(startGame, 8000);
}

/* Splash
--------------------*/
function splash() {
  if (audioEnabled == true) { 
    getSound('sounds/splash.ogg', function (sound) { playSound(sound, .8); });
  }
  document.getElementById('splash-screen').style.animation = 'splash 8s';
}

/* Audio
--------------------*/
function getSound(path, callback) {
  if (audioEnabled == true) {
    var sound = new XMLHttpRequest();
    sound.open('GET', path, true);
    sound.responseType = 'arraybuffer';
 
    // Decode asynchronously
    sound.onload = function() {
      audioContext.decodeAudioData(sound.response, function(buffer) {
        callback(buffer);
      });
    }
    sound.send();
  } 
}

function playSound(buffer, start, loop) {
  var source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(start);
  if (loop == true) {
    source.loop = true;
  }
}

/* Game
--------------------*/
function startGame() {
  playSound(backgroundSoft, 0, true);
  gameCanvas.style.opacity = '1';
  
  // Start Rocket
  drawRocket(rocketX, rocketY);
  
  // Key functions
  document.addEventListener('keydown', function(event) {
    if (event.keyCode == 37 | event.keyCode == 65) {
      moveRocket('left', 10);
    } else if (event.keyCode == 39 | event.keyCode == 68) {
      moveRocket('right', 10);
    }
  });
}

function moveRocket(direction, amount) {
  if (amount > 0) {
    gameContext.clearRect(rocketX, rocketY, 50, 258);
    if (direction == 'left') {
      rocketX = (rocketX - 4);
      drawRocket(rocketX, rocketY);
      setTimeout(function() { moveRocket(direction, (amount - 1)); }, 1);
    } else if (direction == 'right') {
      rocketX = (rocketX + 4);
      drawRocket(rocketX, rocketY);
      setTimeout(function() { moveRocket(direction, (amount - 1)); }, 1);
    }
  }
}

function drawRocket(x, y) {
  gameContext.drawImage(flame, (x+1), (y+82), 49, 176);
  gameContext.drawImage(rocket, x, y, 50, 94);
}
