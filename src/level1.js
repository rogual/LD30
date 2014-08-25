var Player = require('./player');
var V = require('./vector');
var _ = require('lodash');
var util = require('./util');

var blockSz = 25;

function mkblock(engine, startPos) {

  var sys = engine.systems;

  var w = blockSz;
  var h = blockSz;

  var id = sys.id.spawn(engine.state);

  var pos = sys.pos.spawn(engine.state, id, startPos);

  var body = sys.physics.spawn(engine.state, {
    id: id,
    pos: pos,
    group: 'terrain',
    type: 'static',
    shape: {type: 'rect', x: -w/2, y: -h/2, width: w, height: h}
  });

  var r = sys.explosion.spawnResponder(engine.state, id, body);

  var sprite = sys.sprite.spawn(engine.state, id, pos, 'block-1');

  if (Math.random() < (1 / 10)) {
    sys.drop.spawn(engine.state, id, pos, _.sample(['heart', 'bolt']));
  }
}

function mkblockg(engine, offset, gridPos) {
  return mkblock(engine, V.add(offset, V.scale(gridPos, blockSz)));
}

function mkmonument(engine, offset) {

  var base = 250 - blockSz/2;
  var o = [offset, base];

  var rows = _.toArray(arguments).slice(2);
  var height = rows.length;
  _.forEach(rows, function(r, y) {
    _.forEach(r, function(cell, x) {

      if (cell == '.')
        mkblockg(engine, o, [x, -height+y+1]);
    });
  });

}

exports.init = function(engine) {

};

exports.spawn = function(engine) {

  engine.state.parallaxLayers = util.table(
      ['image', 'speed', 'weird'],
      ['bg-happy-1', 0.1, 0],
      //['', .8, 1],
      ['bg-happy-clouds', 0.5, 0],
      ['bg-happy-2', 0.9]
  );

  engine.state.extents = [-20, 1800];

  engine.systems.level.spawnFloor(engine.state);


  mkmonument(engine, 200, "        ",
                          "        ",
                          "        ",
                          " .. . . ",
                          "..... ..");

  mkmonument(engine, 800, "   ..   ",
                          "  ....  ",
                          "  .  .  ",
                          " ...... ",
                          "........");

  mkmonument(engine, 1400, "....       ....",
                           "....       ....",
                           "....       ....",
                           "....       ....",
                           "....       ....       .  ",
                           "....       ....      ....",
                           "....       ....     .....",
                           "....       ....    ......",
                           "....       ....   .......");

  engine.systems.pickup.spawn(engine.state, [1950, 95], 'gun');


  engine.systems.door.spawn(engine.state, [-20, 250], 'level2');
  engine.systems.door.spawn(engine.state, [1120, 250], 'level3');

  var b = engine.systems.blob;
  b.spawn(engine.state, [200, 100]);
  b.spawn(engine.state, [450, 100]);
};
