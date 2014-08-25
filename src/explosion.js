var _ = require('lodash');

exports.init = function(engine) {

  engine.state.explosions = [];
  engine.state.explosionResponders = [];

    var q = 1;
  engine.addProcess(function(dt, state) {
    engine.systems.id.removeDead(state.explosions);
    engine.systems.id.removeDead(state.explosionResponders);

    state.explosions.forEach(function(bang) {
      bang.id.dead = true;
    });

    state.explosionResponders.forEach(function(r) {
      r.body._tmp = r;
    });

    state.collisions.forEach(function(c) {

      if(_.any(c, {group: 'explosion'}) && _.any(c, '_tmp')) {
        var r = _.compact(_.pluck(c, '_tmp'))[0];
        r.id.dead = true;
        return;
      }
    });


  });

};

exports.spawnResponder = function(state, id, body) {
  var r = {
    id: id,
    body: body
  };
  state.explosionResponders.push(r);
  return r;
};

exports.spawn = function(state, pos) {

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);

  var body = sys.physics.spawn(state, {
    id: id,
    type: 'kinematic',
    group: 'explosion',
    pos: pos,
    shape: {
      type: 'circle',
      radius: 50
    }
  });

  var sprite = sys.sprite.spawn(state, id, pos, sys.sprite.circle(50,'#fff'));

  state.explosions.push({
    id: id,
    body: body
  });

};
