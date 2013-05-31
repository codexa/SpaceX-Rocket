/* Globals
--------------------*/
var audioContext, audioEnabled, gameCanvas;
var backgroundSoft;

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
  gameCanvas = document.getElementById("game");
 
  initWebGL(gameCanvas);      // Initialize the GL context
  initShaders();
  initBuffers();
   
  // Only continue if WebGL is available and working
   
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);                      // Set clear color to black, fully opaque
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
  }
  
  setTimeout(function () {
    playSound(backgroundSoft, 0, true);
    gameCanvas.style.opacity = '1';
    // drawScene(start);
  }, 8000);
}

function initWebGL(canvas) {
  // Initialize the global variable gl to null.
  gl = null;
   
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = gameCanvas.getContext("webgl") || gameCanvas.getContext("experimental-webgl");
  }
  catch(e) {}
   
  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
   
  // Create the shader program
   
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
   
  // If creating the shader program failed, alert
   
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
   
  gl.useProgram(shaderProgram);
   
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
}
 
function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
   
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
   
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

/* Splash
--------------------*/
function splash() {
  if (audioEnabled == true) { 
    getSound('sounds/splash.ogg', function (sound) { playSound(sound); });
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

/* Shaders
--------------------*/
function getShader(gl, id) {
  var shaderScript, theSource, currentChild, shader;   
  shaderScript = document.getElementById(id);   
  if (!shaderScript) {
    return null;
  }   
  theSource = "";
  currentChild = shaderScript.firstChild;   
  while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }
     
    currentChild = currentChild.nextSibling;
  }
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
     // Unknown shader type
     return null;
  }
  gl.shaderSource(shader, theSource);
     
  // Compile the shader program
  gl.compileShader(shader);  
     
  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
      return null;  
  }     
  return shader;
}
