var _ = require('lodash');

var next = 1;

exports.init = function(engine) {
  engine.state.ids = {};
  engine.addProcess(function(dt, state) {

    _.forEach(state.ids, function(obj) {
      if (obj.remove)
        delete state.ids[obj.id];
      if (obj.dead) {
        obj.remove = true;
      }
    });

  });
};

exports.spawn = function(state) {
  var obj = {
    id: next ++
  };

  state.ids[obj.id] = obj;
  return obj;
};

exports.removeDead = function(coll) {
  _.remove(coll, function(x) { return x.id && x.id.dead; });
};
