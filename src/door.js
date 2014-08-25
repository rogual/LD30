var _ = require('lodash');


exports.init = function(engine) {

  engine.state.doors = [];

  engine.addProcess(function(dt, state) {
    engine.systems.id.removeDead(state.doors);
  });

  engine.addProcess(function(dt, state) {

    state.doors.forEach(function(d) {
      if (d.levelName == 'rocket') {
        if (state.rocketOpen)
          d.img1 = 'rocket';
        else
          d.img1 = 'rocket-closed';
      }
    });

    if (state.wonTimer !== undefined) {

      state.doors.forEach(function(d) {
        d.sprite.image = 'rocket-won';
      });

      state.wonTimer += dt;

      if (state.wonTimer > 4) {
        state.won = true;
      }
      else if (state.wonTimer > 0.5) {
        state.doors.forEach(function(d) {
          if (d.levelName == 'rocket') {
            state.winAcc += -10 * dt;
            state.winVel += state.winAcc * dt;
            d.sprite.pos[1] += state.winVel;
          }
        });
      }

      return;
    }

    state.doors.forEach(function(d) {
      d.sprite.image = d.img1;
    });

    state.collisions.forEach(function(c) {


      if(_.any(c, {group: 'door'}) && _.any(c, {group: 'player'})) {
        var player = state.player;
        var doorBody = _.compact(_.filter(c, {group: 'door'}))[0];

        var door = _.find(state.doors, {body: doorBody});

        if (door.levelName == 'rocket' && !state.rocketOpen)
          door = null;

        if (door) {

          door.sprite.image = door.img2;

          if (_.contains(state.actions, 'enter')) {
            if (door.levelName == 'rocket')
              doRocket(state);
            else
              state.engine.systems.level.warp(state, door.levelName);
          }
        }

      }
    });
  });

};

exports.spawn = function(state, pos, levelName) {

  var sys = state.engine.systems;

  var id = sys.id.spawn(state);

  var body = sys.physics.spawn(state, {
    id: id,
    pos: pos,
    group: 'door',
    type: 'static',
    shape: {type: 'rect', x: -14, y: -58, width: 28, height: 58}
  });

  var img = 'door';
  var offset = [35, 58];
  if (levelName == 'rocket') {
    img = 'rocket';
    offset = [57, 154];
  }

  var sprite = sys.sprite.spawn(state, id, pos, img , offset);

  var door = {
    img1: img,
    img2: img + '-on',
    id: id,
    body: body,
    sprite: sprite,
    levelName: levelName
  };
  state.doors.push(door);
  return door;

};

function doRocket(state) {
  state.wonTimer = 0;
  state.winVel = 0;
  state.winAcc = 0;
  state.player.sprite.hide = true;
}
