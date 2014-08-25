var _ = require('lodash');


exports.init = function(engine) {

  var keysDown = [];

  window.addEventListener('keydown', function(e) {

    e.preventDefault();

    var key = e.keyCode;

    if (!_.contains(keysDown, key))
      keysDown.push(key);

  });

  window.addEventListener('keyup', function(e) {

    e.preventDefault();

    var key = e.keyCode;

    _.pull(keysDown, key);

  });

  engine.addProcess(function(dt, state) {
    state.keysDown = keysDown;
  });

};
