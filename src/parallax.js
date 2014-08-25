var util = require('./util');
var assets = require('./assets');


exports.init = function(engine) {

  engine.state.parallaxLayers = [];

  var weird = document.createElement('canvas');
  var sc = 1;
  weird.width = 400 * sc;
  weird.height = 50 * sc;
  var c = weird.getContext('2d');
  c.fillRect(0, 0, 10, 10);

  function updateWeird(t) {
    var data = c.getImageData(0, 0, weird.width, weird.height);
    var i = 0;
    var sz = 20;

    var spd0 = .55, spd1 = .8;
    for (var py=0; py<weird.height; py++)
    for (var px=0; px<weird.width; px++) {

      var white = (py > 18 ? 200 : 100);

      var x = (px - weird.width/2) * sc;
      var y = py * sc;

      var min = 0.1;
      var f = (py / weird.height) * (1 - min) + min;

      var fx = x / f;
      var fy = y / f * 20;

      var v = white * (
        (
          Math.floor(util.mod(fx / sz - (t * 0.07), 2)) !=
          Math.floor(util.mod(fy / sz, 2))
        )
      );

      var j = 4 * i++;
      data.data[j + 0] = v;
      data.data[j + 1] = v;
      data.data[j + 2] = v;
      data.data[j + 3] = 255;
    }
    c.putImageData(data, 0, 0);
  }

  engine.addLayer(function(context, state) {

    var x = -state.camera[0];

    state.parallaxLayers.forEach(function(layer) {
      if (layer.weird) {
        updateWeird(x);
        context.drawImage(
          weird,
          0, 250 - weird.height / sc,
          weird.width / sc, weird.height / sc
        );
      }
      else
        drawParallax(context, assets.gfx[layer.image], layer.speed, x);
    });
  });


};

function drawParallax(context, image, spd, t) {
  var w = image.width;
  var screenWidth = context.canvas.width;
  var x0 = Math.floor(util.mod(t * spd, screenWidth));

  context.drawImage(image, x0, 0);
  if (x0 > 0)
    context.drawImage(image, x0 - w, 0);

}

