var _ = require('lodash');

var util = require('./util');
var V = require('./vector');


exports.init = function(engine) {
  engine.addProcess(function(dt, state) {

    var tt = (state.levelName == 'level3') && state.treeThing;

    if (tt) {

      if (tt.id.dead)
        state.treeThing = null;

      tt.time += dt;

      if (tt.hitTimer) {
        tt.hitTimer -= dt;
        if (tt.hitTimer <= 0) {
          tt.hitTimer = 0;
          tt.sprite.flash = false;
        }
      }

      if (tt.fireTimer) {
        tt.fireTimer -= dt;
        if (tt.fireTimer <= 0) {

          var f = (Math.sin(tt.time * 6.282 / 20) + 1) / 2;
          var low = 0.3, high = 2;

          tt.fireTimer = low + f * (high - low);
          ttFire(state, tt);
        }
      }

      state.collisions.forEach(function(c) {
        if (_.contains(c, tt.body)) {

          if (_.any(c, {group: 'weapon'}))
            ttTakeDamage(state);
        }
      });
    }

  });
};

exports.spawn = function(engine) {

  var fh = 0;
  var base = 250 - fh;

  engine.state.parallaxLayers = util.table(
      ['image', 'speed', 'weird'],
      ['bg-forest-1', 0.29, 0],
      ['bg-forest-2', 0.59, 0]
  );

  var sys = engine.systems;

  engine.state.extents = [-1000, 500];

  sys.level.spawnFloor(engine.state, fh);

  util.table(
    ['image', 'pos', 'scale'],
    ['bush1', [800, 170], [1, 1]],
    ['bush1', [-1100, 170], [-1, 1]],
    ['bush2', [-200, 180], [1, 1]]
  ).forEach(function(item) {
    var id = engine.systems.id.spawn(engine.state);
    var sprite = engine.systems.sprite.spawn(engine.state, id, item.pos, item.image);
    sprite.scale = item.scale;
  });

  sys.door.spawn(engine.state, [-550, base], 'level1');
  sys.door.spawn(engine.state, [ 50, base], 'level2');

  sys.door.spawn(engine.state, [ 500, base], 'rocket');

  sys.pickup.spawn(engine.state, [-1148, 205], 'bomb');

  sys.blob.spawn(engine.state, [620, 60], 1);

  engine.state.treeThing = spawnTreeThing(engine.state, [-850, base]);



};

function spawnTreeThing(state, pos) {
  var sys = state.engine.systems;

  var id = sys.id.spawn(state);
  var sprite = sys.sprite.spawn(state, id, pos, 'tree-thing', [32, 176]);

  var pt = V.add(pos, [15, -120]);

  var fs = sys.sprite.spawn(state, id, pt, 'flower');

  var block = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    shape: {type: 'rect', x: -50, y: -100, width: 75, height: 100},
    type: 'kinematic',
    group: 'solidEnemy'
  });

  sys.explosion.spawnResponder(state, id, block);

  return {
    id: id,
    body: block,
    sprite: sprite,
    hp: 16,
    hitTimer: 0,
    fireTimer: 1,
    time: 0,
    pt: pt
  };
}

function ttTakeDamage(state) {

  var tt = state.treeThing;

  if (tt.hitTimer)
    return;

  tt.hp -= 1;

  if (tt.hp) {
    tt.sprite.flash = true;
    tt.hitTimer = 0.4;
  }
  else {
    tt.id.dead = true;
  }
}

function ttFire(state, tt) {

  var diff = V.sub(state.player.pos.pos, tt.pt);
  var dist = V.mag(diff);

  if (dist > 230)
    return;

  var dir = V.norm(diff);

  var spd = 50;

  var pos = tt.pt;
  var vel = V.scale(dir, spd);

  state.engine.systems.shot.spawn(state, pos, vel, {
    group: 'enemyWeapon'
  });
}
