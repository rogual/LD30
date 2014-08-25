

exports.init = function(engine) {
  engine.state.pos = [];

  engine.addProcess(function(dt, state) {
    engine.systems.id.removeDead(state.pos);
  });

};

exports.spawn = function(state, id, pos) {
  var obj = {
    id: id,
    pos: pos || [0, 0],
    rot: 0
  };
  state.pos.push(obj);
  return obj;
};
