var _ = require('lodash');

var util = require('./util');
var systems = require('../gen/systems');
var assets = require('./assets');


exports.init = function(context) {

  var state = {};
  var processes = [];
  var layers = [];

  var engine = {
    processes: processes,
    systems: {},
    state: state,
    addProcess: processes.push.bind(processes),
    addLayer: layers.push.bind(layers)
  };

  state.engine = engine;

  function init(name, mod) {
    mod.init(engine);
    engine.systems[name] = mod;
  }

  systems.init(init);

  context.drawImage(assets.gfx.title, 0, 0);

  waitForKey(function() {

    state.stack = ['heart', 'heart'];

    state.items = [];
//    state.items = ['gun', 'bomb', 'sword'];

    state.startLevel = 'level3';
    state.loadLevel = state.startLevel;

    startLoop(function(dt) {
      processes.forEach(function(x) { x(dt, state); });
    }, function() {
      layers.forEach(function(x) { x(context, state); });
    });

  });


};

function startLoop(process, draw) {

  var step = 1 / 60;
  var stepMs = 1000 * step;
  var acc = 0;

  var running = true;

  window.requestAnimationFrame(function(t) {

    var last = t;

    function doFrame(t) {
      var dt = t - last;
      last = t;

      acc += dt;
      while (acc >= stepMs) {
        acc -= stepMs;
        process(step);
      }
      draw();
      nextFrame();
    }

    function nextFrame() {
      if (running)
        window.requestAnimationFrame(doFrame);
    }

    nextFrame();

  });

  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 27)
      running = false;
  });
}


function waitForKey(then) {
  function tmp() {
    window.removeEventListener('keydown', tmp);
    then();
  }
  window.addEventListener('keydown', tmp);
}
