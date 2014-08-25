

exports.init = function(engine) {
  engine.state.drops = [];

  engine.addProcess(function(dt, state) {
    engine.state.drops.forEach(function(d) {
      if (d.id.dead) {
        engine.systems.pickup.spawn(state, d.pos, d.item);
      }
    });

    engine.addProcess(function(dt, state) {
      engine.systems.id.removeDead(state.drops);
    });
  });
};

exports.spawn = function(state, id, pos, item) {

  var d = {
    id: id,
    pos: pos,
    item: item
  };

  state.drops.push(d);

  return d;

};
