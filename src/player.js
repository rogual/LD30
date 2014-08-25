var _ = require('lodash');

var util = require('./util');
var V = require('./vector');

var Sprite = require('./sprite');

exports.spawn = function(state, startPos) {

  // make sprite
  var id = state.engine.systems.id.spawn(state);
  var pos = state.engine.systems.pos.spawn(state, id, startPos);
  var sprite = Sprite.spawn(state, id, pos, 'p-stand', [24, 32]);

  // make phys
  var body = state.engine.systems.physics.spawn(state, {
    id: id,
    pos: pos,
    group: 'player',
    //shape: {type: 'rect', x: -7, y: -10, width: 15, height: 24}
    shape: {type: 'circle', radius: 7, offset: [0, 7]}
  });

  // make anim
  state.anims.push({
    sprite: sprite,
    duration: 0.4,
    timer: 0,
    frames: ['p-walk-1', 'p-walk-2', 'p-walk-1', 'p-walk-3']
  });
  var anim = _.last(state.anims);

  state.player = {
    id: id,
    pos: pos,
    sprite: sprite,
    body: body,
    anim: anim
  };

  state.player.itemTimer = 0;
  state.weaponTimer = 0;

  return state.player;

};


exports.init = function(engine) {

  engine.state.camera = [0, 0];
  engine.state.items = [];
  engine.state.itemIndex = 0;

  engine.addProcess(function(dt, state) {

    if (state.wonTimer !== undefined)
      return;

    if (state.lost) {
      if (V.mag(state.intent) || state.actions.length) {
        state.lost = false;
        state.levelName = null;

        state.stack = ['heart', 'heart'];
        engine.systems.level.warp(state, state.startLevel);
        return;
      }
    }

    var player = state.player;
    if (!player)
      return;

    if (state.deadTimer && state.deadTimer > 0) {
      state.deadTimer -= dt;
      if (state.deadTimer <= 0)
        state.lost = true;
    }

    if (player.damageTimer) {
      player.damageTimer -= dt;
      player.sprite.flash = true;
      if (player.damageTimer <= 0) {
        player.damageTimer = null;
        player.sprite.flash = false;

        if (state.stack.lastIndexOf('heart') == -1)
          die(state);
      }
    }

    if (state.weaponTimer) {
      state.weaponTimer -= dt;
      if (state.weaponTimer <= 0)
        state.weaponTimer = 0;
    }

    if (player.itemTimer) {
      player.itemTimer -= dt;
      if (player.itemTimer <= 0) {
        player.itemTimer = null;
        state.weapon.id.dead = true;
        state.weapon = null;
      }
    }

    var grounded = false;
    state.collisions.forEach(function(c) {
      if(_.contains(c, player.body)) {
        if (_.any(c, {group: 'terrain'})) {
          grounded = true;
        }
        else if (_.any(c, {group: 'enemy'})) {
          takeDamage(state);
        }
        else if (_.any(c, {group: 'explosion'})) {
          takeDamage(state);
        }
        else if (_.any(c, {group: 'enemyWeapon'})) {
          takeDamage(state);
        }
      }
    });

    var intent = state.intent;

    if (!player.itemTimer) {
      if (intent[0] > 0)
        player.sprite.scale = [-1, 1];

      if (intent[0] < 0)
        player.sprite.scale = [1, 1];

      if (intent[0])
        player.anim.frames = ['p-walk-1', 'p-walk-2', 'p-walk-1', 'p-walk-3'];
      else
        player.anim.frames = ['p-stand'];

    }

    var speed = 100 + power(state) * 50;
    var airCtrlAcc = 300;
    var airCtrlVel = 80;

    var body = player.body;

    if (player.itemTimer) {
      body.surfaceVel = [0, 0];
    }
    else if (grounded)
      body.surfaceVel = V.scale(intent, speed);
    else
      body.surfaceVel = [body.vel[0], 0];

    if (Math.abs(body.vel[0]) < airCtrlVel ||
        util.sgn(intent[0]) != util.sgn(body.vel[0]))
      body.acc = V.scale(intent, airCtrlAcc);
    else
      body.acc = [0, 0];

    if (_.contains(state.actions, 'jump') && grounded) {

      body.vel[1] = -300;
    }

    _.times(3, function(i) {
      if (_.contains(state.actions, i.toString()))
        state.itemIndex = i;
    });

    if (_.contains(state.actions, 'use')) {
      useItem(state);
    }

    state.camera = [body.pos.pos[0], 0];
    if (state.extents)
      state.camera[0] = Math.min(state.extents[1],
                                 Math.max(state.extents[0], state.camera[0]));
  });

  engine.state.bombs = [];

  engine.addProcess(function(dt, state) {
    engine.systems.id.removeDead(engine.state.bombs);

    engine.state.bombs.forEach(function(bomb) {

      if (bomb.timer !== undefined) {
        bomb.timer -= dt;
        if (bomb.timer <= 0) {
          bomb.id.dead = true;
          engine.systems.explosion.spawn(state, bomb.pos);
        }
      }
      else
        state.collisions.forEach(function(c) {
          if(_.contains(c, bomb.body)) {
            bomb.timer = 0.6;
            return;
          }
        });

    });

  });

};

function useGun(state) {
  var p = state.player;

  var dir = -p.sprite.scale[0];

  var start = V.add(p.pos.pos, [15 * dir, -1]);

  var vel = V.add(p.body.vel, [100*dir, 0]);

  require('./debug').setj('xxx', [dir, start]);

  state.engine.systems.shot.spawn(state, start, vel);
}

function throwBomb(state, spos, svel, dir) {

  var start = V.add(spos, [dir*10, -10]);

  var vel = [dir * 200, -250];

  vel = V.scale(vel, 0.8);
  vel[0] += svel[0];

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);
  var pos = sys.pos.spawn(state, id, start);

  var sprite = sys.sprite.spawn(state, id, pos, 'bomb');

  var hi = sys.sprite.spawn(state, id, pos, sys.sprite.circle(1, '#fff'), [0, -3]);

  var body = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    vel: vel,
    group: 'bomb',
    rotate: true,
    shape: {type: 'circle', radius: 5},
    material: 'bomb'
  });

  state.bombs.push({
    id: id,
    pos: pos,
    body: body
  });

}

function takeDamage(state) {
  if (state.player.damageTimer)
    return;

  state.player.body.vel = [-100 * util.sgn(state.player.body.vel[0]), -100];
  state.player.anim.frames = ['p-walk-2'];


  var i = state.stack.lastIndexOf('heart');
  if (i != -1) {
    state.stack = state.stack.slice(0, i);
  }

  i = state.stack.lastIndexOf('heart');
  if (i != -1)
    state.player.damageTimer = 1;
  else
    state.player.damageTimer = 0.3;

}

function die(state) {
  state.engine.systems.explosion.spawn(state, state.player.pos.pos);
  state.player.id.dead = true;

  state.deadTimer = 1;
}

function useSword(state) {
  var p = state.player;

  if (state.weapon)
    return;

  p.anim.frames = ['p-thrust'];

  p.itemTimer = 0.2 + 0.2 * (1 - power(state));

  var pos = V.add(
    p.pos.pos, [30 * -p.sprite.scale[0], 3]
  );

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);

  var body = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    group: 'weapon',
    type: 'kinematic',
    shape: {type: 'circle', radius: 5},
  });

  state.weapon = {
    id: id,
    body: body
  };
}

function useItem(state) {
  var item = state.items[state.itemIndex];

  if (item == 'sword')
    useSword(state);

  if (state.weaponTimer)
    return;

  state.weaponTimer = (1 - power(state)) * 0.4;

  if (item == 'bomb')
    throwBomb(
      state,
      state.player.body.pos.pos,
      state.player.body.vel,
      -state.player.sprite.scale[0]
    );

  if (item == 'gun')
    useGun(state);
}

function power(state) {
  var c = _.filter(state.stack, function(x) { return x == 'bolt'; }).length;
  require('./debug').setj('yyy', c);

  c = Math.min(3, c);

  return c / 3;
}
