// Globals
var audioContext, audioEnabled;
var sounds = [];

// Initialize
window.addEventListener('DOMContentLoaded', function() { init(); });

function init() {
  // Set up audio
  initAudio();
  
  // Splash screen
  splash();
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

// Splash
function splash() {
  if (audioEnabled == true) {
    var sound = new XMLHttpRequest();
    sound.open('GET', 'sounds/splash.ogg', true);
    sound.responseType = 'arraybuffer';
 
    // Decode asynchronously
    sound.onload = function() {
      audioContext.decodeAudioData(sound.response, function(buffer) {
        playSound(buffer);
      });
    }
    sound.send();
  }
  document.getElementById('splash-screen').style.animation = 'splash 8s';
}

// Sounds
function playSound(buffer) {
  var source = audioContext.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(audioContext.destination);       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
}