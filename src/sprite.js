var _ = require('lodash');
var Q = require('q');
var V = require('./vector');

var assets = require('./assets');

exports.circle = function(rad, fill) {
  return function(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, 6.282, false);
    ctx.fillStyle = fill;
    ctx.fill();
  };
};


var flash = false;

exports.init = function(engine) {

  engine.state.sprites = [];

  engine.addProcess(function(dt, state) {
    engine.systems.id.removeDead(state.sprites);
  });

  engine.addLayer(function(context, state) {
    flash = !flash;
    var cam = state.camera;
    state.sprites.forEach(_.partial(drawSprite, cam, assets.gfx, context));
  });

};

exports.spawn = function(state, id, pos, image, offset) {
  var sprite = {
    id: id,
    pos: pos,
    image: image,
    offset: offset,
    scale: [1, 1]
  };
  state.sprites.push(sprite);
  return sprite;
};

function drawSprite(cam, gfx, context, sprite) {

  if (sprite.flash && flash)
    return;

  if (sprite.hide)
    return;

  var p = V.sub(sprite.pos.pos || sprite.pos, cam);
  p = V.add(p, [200, 0]);
  var x = Math.floor(p[0]);
  var y = Math.floor(p[1]);

  context.save();
  context.translate(x, y);

  if (typeof(sprite.image) == 'function') {
    if (sprite.offset)
      context.translate(sprite.offset[0] || 0, sprite.offset[1] || 0);
  }

  context.scale(sprite.scale[0], sprite.scale[1]);

  if (sprite.pos.rot)
    context.rotate(sprite.pos.rot);

  if (typeof(sprite.image) == 'function') {
    sprite.image(context);
  }
  else {
    var image = gfx[sprite.image];

    if (!sprite.offset)
      sprite.offset = [image.width / 2, image.height / 2];

    if (sprite.image == 'door')
    require('./debug').setj('dof', sprite.offset);

    context.drawImage(image, -sprite.offset[0], -sprite.offset[1]);
  }

  context.restore();
}
