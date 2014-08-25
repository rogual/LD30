var _ = require('lodash');



function getStuff(state, stuff) {
  if (state.stack.length < 6) {
    state.stack.push(stuff);
  }
}

function getItem(state, item) {
  if (!_.contains(state.items, item))
    state.items.push(item);
}

var logic = {};
logic.heart = function(state) {
  getStuff(state, 'heart');
};

logic.bolt = function(state) {
  getStuff(state, 'bolt');
};

logic.sword = function(state) {
  getItem(state, 'sword');
};

logic.bomb = function(state) {
  getItem(state, 'bomb');
};

logic.gun = function(state) {
  getItem(state, 'gun');
};


exports.init = function(engine) {

  engine.state.pickups = [];

  engine.addProcess(function(dt, state) {
    engine.systems.id.removeDead(state.pickups);

    engine.state.collisions.forEach(function(c) {

      var pickupBody = _.find(c, {group: 'pickup'});

      if (pickupBody) {

        var pickup = pickupBody.pickup;

        logic[pickup.type](state);

        pickup.id.dead = true;

      }

    });


  });

};

exports.spawn = function(state, pos, type) {

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);

  var sprite = sys.sprite.spawn(state, id, pos, {
    heart: 'ui-heart',
    bolt: 'ui-bolt',
    bomb: 'ui-bomb',
    sword: 'ui-sword',
    gun: 'ui-gun',
  }[type]);

  var body = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    group: 'pickup',
    type: 'static',
    shape: {type: 'circle', radius: 16},
  });

  var p = {
    id: id,
    type: type,
    sprite: sprite,
    body: body
  };

  body.pickup = p;

  state.pickups.push(p);
  return p;

};
