var _ = require('lodash');


exports.mod = function(a, b) {
  if (a < 0)
    return b + (a % b);
  return a % b;
};

exports.table = function(names) {
  return _.toArray(arguments).slice(1).map(_.partial(_.object, names));
};

exports.sgn = function(x) {
  if (x < 0) return -1;
  if (x > 0) return 1;
  return 0;
};

exports.lol = function(state, pos) {
  var engine = state.engine;
          var id = engine.systems.id.spawn(state);
          var s = engine.systems.sprite.spawn(state, id, pos, 'lol');
          s.flash = true;

          setTimeout(function() {
            id.dead = true;
          }, 200);
};
