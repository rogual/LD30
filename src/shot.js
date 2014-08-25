var _ = require('lodash');

exports.init = function(engine) {
  engine.state.shots = [];

  engine.addProcess(function(dt, state) {

    engine.systems.id.removeDead(state.shots);

    engine.state.shots.forEach(function(s) {
      s.ttl -= dt;
      if (s.ttl <= 0)
        s.id.dead = true;

    });

    state.collisions.forEach(function(c) {

      var shot = _.compact(_.pluck(c, 'shot'))[0];
      if (shot) {

      //  if(_.any(c, {group: 'terrain'})) {
          shot.id.dead = true;
       // }
      }
    });

  });

};

exports.spawn = function(state, startPos, vel, opts) {

  opts = opts || {};

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);
  var pos = sys.pos.spawn(state, id, startPos);
  var body = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    vel: vel,
    shape: {type: 'circle', radius: 3},
    type: 'kinematic',
    group: opts.group || 'weapon',
  });

  var sprite = sys.sprite.spawn(state, id, pos, sys.sprite.circle(3, '#ff0'));

  var s = {
    ttl: 5,
    id: id,
    pos: pos,
    body: body,
    sprite: sprite
  };

  body.shot = s;

  state.shots.push(s);
  return s;
};
