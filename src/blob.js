var Sprite = require('./sprite');
var Physics = require('./physics');

var V = require('./vector');
var util = require('./util');
var _ = require('lodash');


exports.init = function(engine) {

  engine.state.blobs = [];

  engine.addProcess(function(dt, state) {

    state.blobs.forEach(function(blob) {

      state.collisions.forEach(function(c) {
        if(_.contains(c, blob.body) && _.any(c, {group: 'weapon'})) {
          blob.id.dead = true;
          util.lol(state, blob.pos.pos);
          if (blob.mode)
            state.rocketOpen = true;
        }
      });

      if (state.player && !blob.mode) {

        var pp = state.player.body.pos.pos;
        var bp = blob.body.pos.pos;
        var diff = V.sub(bp, pp);

        if (!diff[0] && !diff[1])
          return;

        var distanceSq = V.magSq(diff);
        var angle = Math.atan2(diff[1], diff[0]);

        var dir = V.norm(diff);

       var target = 100;

        var tdiff = target * target- distanceSq;

        var force;
        if (Math.abs(tdiff) > 20) {

          force = util.sgn(tdiff) * 200;

        }
        else
          force = 0;
          blob.body.acc = V.scale(dir, force);

        if (blob.body.pos[1] > state.player.body.pos[1] - 50)
          blob.body.acc[1] -= 50;

      }


    });
  });
};


exports.spawn = function(state, startPos, mode) {

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);

  var pos = sys.pos.spawn(state, id, startPos);

  var sprite = sys.sprite.spawn(state, id, pos, 'gaper1');

  var body = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    group: 'enemy',
    material: 'rubber',
    shape: {type: 'circle', radius: 16},
    gravity: 0
  });

  state.blobs.push({
    id: id,
    pos: pos,
    mode: mode,
    sprite: sprite,
    body: body
  });

  state.anims.push({
    sprite: sprite,
    duration: 0.4,
    timer: 0,
    frames: ['gaper1', 'gaper3']
  });
  var anim = _.last(state.anims);

  var r = sys.explosion.spawnResponder(state, id, body);

};
