var _ = require('lodash');

var util = require('./util');
var V = require('./vector');


exports.init = function(engine) {

  engine.state.pressed = [];

  engine.addProcess(function(dt, state) {

    update(state);

  });
};


var controls = util.table(
  ['name',  'intent', 'keys'],
  ['jump',  [0,  0], [" "]],
  ['use',   [0,  0], ["G", "H", "Q", "E"]],
  ['enter', [0,  0], ["W", 38]],
  ['left',  [-1, 0], ["A", 37]],
  ['right', [1,  0], ["D", 39]],
  ['0',     [0,  0], ["1"]],
  ['1',     [0,  0], ["2"]],
  ['2',     [0,  0], ["3"]]
);


function toCharCode(x) {
  return typeof(x) == 'string' ? x.charCodeAt(0) : x;
}


function update(state) {

  var downControls = _.filter(controls, function(c) {
    return _.any(c.keys, function(key) {
      return _.contains(state.keysDown, toCharCode(key));
    });
  });

  var pressed = _.pluck(downControls, 'name');

  state.actions = _.reject(pressed, _.partial(_.contains, state.pressed));
  state.pressed = pressed;

  state.intent =
    V.norm(_.reduce(_.pluck(downControls, 'intent'), V.add, [0, 0]));


}
