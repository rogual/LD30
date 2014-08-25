var util = require('./util');


exports.init = function(engine) {
};

exports.spawn = function(engine) {

  var fh = 12;
  var base = 250 - fh;


  engine.state.parallaxLayers = util.table(
      ['image', 'speed', 'weird'],
      ['', 0.5, 1],
      ['bg-castle-1', 0.29, 0],
      ['bg-castle-2', 0.5, 0]
  );

  engine.state.extents = [-500, 600];

  engine.systems.level.spawnFloor(engine.state, fh);


  var sys = engine.systems;

  sys.door.spawn(engine.state, [-20, base], 'level1');
  sys.door.spawn(engine.state, [620, base], 'level3');

  sys.enemy.spawnGrump(engine.state, [200, base - 80]);
  sys.enemy.spawnGrump(engine.state, [300, base - 80]);
  sys.enemy.spawnGrump(engine.state, [400, base - 80]);

  sys.enemy.spawnGrump(engine.state, [-220, base - 80]);
  sys.enemy.spawnGrump(engine.state, [-320, base - 80]);
  sys.enemy.spawnGrump(engine.state, [-420, base - 80]);

  sys.pickup.spawn(engine.state, [-600, 170], 'sword');


};
