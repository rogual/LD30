var V = require('./vector');
var _ = require('lodash');

var nape = require('./nape');

exports.spawn = function(state, args) {
  state.physics.push(args);
  return args;
};

var flags = {
  terrain: 1 << 1,
  player: 1 << 2,
  enemy: 1 << 3,
  explosion: 1 << 4,
  bomb: 1 << 5,
  weapon: 1 << 6
};

var filters = {
  'terrain': {
    collisionGroup: flags.terrain,
    sensorGroup: flags.terrain,
  },
  'player': {
    collisionGroup: flags.player,
    sensorGroup: flags.player,
    sensorMask: ~flags.terrain
  },
  'enemy': {
    collisionGroup: flags.enemy,
    collisionMask: flags.terrain | flags.enemy | flags.bomb,
    sensorGroup: flags.enemy,
    sensorMask: flags.player | flags.explosion | flags.weapon
  },
  'solidEnemy': {
    collisionGroup: 1,
    collisionMask: ~0,
    sensorGroup: flags.enemy,
    sensorMask: flags.explosion | flags.weapon
  },
  'explosion': {
    collisionGroup: 0,
    collisionMask: 0,
    sensorGroup: flags.explosion
  },
  'weapon': {
    collisionGroup: 0,
    collisionMask: 0,
    sensorGroup: flags.weapon,
    sensorMask: flags.enemy | flags.terrain
  },
  'enemyWeapon': {
    collisionGroup: 0,
    collisionMask: 0,
    sensorGroup: flags.weapon,
    sensorMask: flags.player | flags.terrain
  },
  'bomb': {
    collisionGroup: flags.bomb,
    collisionMask: flags.terrain | flags.enemy | 1,
    sensorMask: 0,
    sensorGroup: 0
  },
  'door': {
    collisionMask: 0,
    collisionGroup: 0,
    sensorMask: flags.player
  },
  'pickup': {
    collisionMask: 0,
    collisionGroup: 0,
    sensorMask: flags.player
  }
};


exports.init = function(engine) {

  nape.init();

  var space = new nape.space.Space(new nape.geom.Vec2(0, 800));
  space.toJSON = function() { return "ph"; };

  exports.space = space;

  var material = new nape.phys.Material(0, 0.5, 0.5, 0.001);
  var materials = {
    'bomb': new nape.phys.Material(1.2, 0.01, 0.02, 0.01),
    'rubber': new nape.phys.Material(1.2, 0.01, 0.02, 0.001)
  };

  var thing = [
    nape.callbacks.CbType.get_ANY_BODY()
  ];

  var listener = new nape.callbacks.InteractionListener(
    nape.callbacks.CbEvent.get_ONGOING(),
    nape.callbacks.InteractionType.get_ANY(),
    thing,
    thing,
    function(e) {
      engine.state.collisions.push([e.int1.userData, e.int2.userData]);
    }
  );
  space.listeners.push(listener);

  engine.state.physics = [];

  engine.addProcess(function(dt, state) {
    state.physics.forEach(function(item) {
      if (item.id && item.id.dead) {
        space.bodies.remove(item.body);
      }
    });
    engine.systems.id.removeDead(state.physics);
  });

  window.nape = nape;
  window.space  = space;
  engine.addProcess(function(dt, state) {

    state.collisions = [];

    state.physics.forEach(function(item) {

      if (item.gravity === undefined)
        item.gravity = 1;

      if (!item.surfaceVel) item.surfaceVel = [0, 0];
      if (!item.vel) item.vel = [0, 0];
      if (!item.acc) item.acc = [0, 0];

      if (!item.body) {

        var body = item.body = new nape.phys.Body(
          {
            "dynamic": nape.phys.BodyType.get_DYNAMIC(),
            "static": nape.phys.BodyType.get_STATIC(),
            "kinematic": nape.phys.BodyType.get_KINEMATIC(),
          }[item.type || "dynamic"],
          toVec(item.pos.pos || item.pos || [0, 0])
        );
        body.toJSON = function() { return 'bdy';};

        body.allowRotation = !!item.rotate;

        var shape = toShape(item.shape);
        shape.set_material(materials[item.material] || material);
        shape.set_sensorEnabled(true);

        var filterParams = filters[item.group] || {};
        var filter = new nape.dynamics.InteractionFilter();
        _.forEach(filterParams, function(v, k) {
          filter[k] = v;
        });

        shape.set_filter(filter);

        body.shapes.add(shape);


        body.mass = item.mass || 1;
        body.inertia = item.inertia || 1;

        body.gravMass = item.gravity;

        space.bodies.add(body);

        body.userData = item;
      }

      item.body.surfaceVel.setxy(item.surfaceVel[0], item.surfaceVel[1]);
      item.body.velocity.setxy(item.vel[0], item.vel[1]);
      item.body.applyImpulse(toVec(V.scale(item.acc, dt)));

    });

    space.step(dt);

    state.physics.forEach(function(item) {
      if (item.rotate)
        item.pos.rot = item.body.rotation;

      if (item.pos && item.pos.pos) item.pos.pos = [
        item.body.position.x,
        item.body.position.y
      ];
      item.vel = [
        item.body.velocity.x,
        item.body.velocity.y
      ];
    });

  });

};

function toShape(item) {

  if (item.type == 'rect') {
    return new nape.shape.Polygon(nape.shape.Polygon.rect(
      item.x, item.y, item.width, item.height
    ));
  }

  if (item.type == 'circle') {
    return new nape.shape.Circle(item.radius, toVec(item.offset || [0, 0]));
  }

  throw new Error();
}

function toVec(v) {
  return new nape.geom.Vec2(v[0], v[1]);
}
