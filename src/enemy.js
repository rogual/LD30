var _ = require('lodash');
var util = require('./util');

var t = 0;

var spawnTimer = function(state, id, time) {
  state.timers.push({
    id: id,
    time: time
  });
};

exports.init = function(engine) {

  engine.state.enemies = [];

  engine.addProcess(function(dt, state) {
    engine.systems.id.removeDead(state.enemies);
  });


  engine.addProcess(function(dt, state) {

    t += dt;

    state.enemies.forEach(function(enemy) {
      enemy.grounded = false;
      enemy.body.enemy = enemy;
    });

    state.collisions.forEach(function(c) {

      var enemy = _.compact(_.pluck(c, 'enemy'))[0];
      if (enemy) {
        if (_.any(c, {group: 'terrain'})) {
          enemy.grounded = true;
        }

        if (_.any(c, {group: 'weapon'})) {
          require('./debug').setj('ew', 'we');
          enemy.id.dead = true;

          util.lol(state, enemy.pos.pos);

        }
      }

    });

    state.enemies.forEach(function(enemy) {
      logics[enemy.logic](enemy, dt, state);
    });

  });
};

function spawnEnemy(state, id, pos, sprite, body, logic) {
  var e = {
    id: id,
    pos: pos,
    sprite: sprite,
    body: body,
    logic: logic
  };
  var r = state.engine.systems.explosion.spawnResponder(state, id, body);
  state.enemies.push(e);
  return e;
}

exports.spawnGrump = function(state, startPos) {

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);
  var pos = sys.pos.spawn(state, id, startPos);

  var sprite = sys.sprite.spawn(state, id, pos, 'grump-1', [20, 18]);

  var body = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    shape: {type: 'circle', radius: 10},
    group: 'enemy'
  });

  var e = spawnEnemy(state, id, pos, sprite, body, 'grump');
  e.timer = Math.random(10) + 3;
  return e;
};

var logics = {};


logics.grump = function(grump, dt, state) {


  if (grump.grounded) {
    grump.sprite.image = ['grump-1', 'grump-2'][Math.floor(t / 1.8) % 2];
    grump.sprite.offset = [20, 18];
  }
  else {
    grump.sprite.image = 'grump-3';
    grump.sprite.offset = [20, 28];
  }

  if (grump.timer > 0) {
    grump.timer -= dt;
    if (grump.timer <= 0) {
      grump.body.vel[1] = -400;
      grump.timer = 4 + Math.random(8);
    }
  }
};





