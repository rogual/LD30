var _ = require('lodash');
var V = require('./vector');


exports.spawnFloor = function(state, height) {
  var engine = state.engine;
  var id = engine.systems.id.spawn(engine.state);
  var hw = 1000;


  function mkBarrier(x, y, width, height) {
    return engine.systems.physics.spawn(engine.state, {
      id: id,
      pos: [0, 250],
      group: 'terrain',
      type: 'kinematic',
      shape: {type: 'rect', x: x, y: y, width: width, height: height}
    });
  }

  var base = -(height || 0);

  engine.state.barriers = [
    mkBarrier(-hw, base, hw*2, 100),
    mkBarrier(state.extents[0] - 100 - 200, base - 250, 100, 250),
    mkBarrier(state.extents[1] + 200, base - 250, 100, 250),
  ];
};

exports.warp = function(state, levelName) {

  _.forEach(state.ids, function(id) {
    id.dead = true;
  });

  state.loadLevel = levelName;
};

exports.init = function(engine) {

  // floor
  engine.addProcess(function(dt, state) {

    if (!engine.state.barriers)
      return;

    _.pull(engine.state.bariers, function(b) { return b.id.dead; });

    engine.state.barriers.forEach(function(body, i) {
      if (i === 0)
        body.body.position.x = state.camera[0];
    });

  });


  // stuff
  engine.addProcess(function(dt, state) {

    if (state.loadLevel) {

      var cameFrom = state.levelName;
      state.levelName = state.loadLevel;

      engine.systems[state.loadLevel].spawn(engine);
      state.loadLevel = null;

      var s = engine.systems.physics.space;

      var startPos = [-70, 240];
      if (cameFrom) {
        var door = _.find(state.doors, {levelName: cameFrom});
        if (door)
          startPos = V.sub(door.body.pos, [0, 14]);
      }

      engine.systems.player.spawn(engine.state, startPos);


    }

  });
};
