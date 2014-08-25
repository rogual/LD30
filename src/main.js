var _ = require('lodash');
var game = require('./game');
var dom = require('./dom');
var assets = require('./assets');


var logicalSize = [400, 250];


function onResize(canvas) {

  var w = window.innerWidth;
  var h = window.innerHeight;

  var scales = [1, 2, 4, 8];

  var scaleOK = function(scale) {
    return scale * logicalSize[0] <= w &&
           scale * logicalSize[1] <= h;
  };

  var okScales = _.filter(scales, scaleOK);

  var scale = _.last(okScales) || 1;

  canvas.style.width = logicalSize[0] * scale + 'px';
  canvas.style.height = logicalSize[1] * scale + 'px';
}

function handleError(e) {
  console.error('Error!', e.message, e);
}

window.addEventListener('error', handleError);

window.addEventListener('load', function() {

  document.body.style.backgroundColor = '#a0a';

  var canvas = document.createElement('canvas');
  canvas.width = logicalSize[0];
  canvas.height = logicalSize[1];
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  dom.disableAntiAliasing(canvas);
  document.body.appendChild(canvas);

  var help = document.createElement('span');
  help.innerHTML = 'Arrows or WASD to move • Space to jump • W/Up to enter doors<br>1/2/3 to select item • G/H/Q/E to use';
  help.style.margin = '10px auto';
  help.style.color = 'white';
  help.style.fontFamily = 'Monaco, Consolas, Courier';
  help.style.fontWeight = 'bold';
  help.style.padding = '2px 10px';
  help.style.opacity = '.6';


  var d = document.createElement('div');
  d.style.textAlign = 'center';
  d.style.padding = '10px';
  document.body.appendChild(d);
  d.appendChild(help);

  var context = canvas.getContext('2d');
  context.fillRect(0, 0, logicalSize[0], logicalSize[1]);

  context.imageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;

  onResize(canvas);
  window.addEventListener('resize', _.partial(onResize, canvas));

  assets.loadAll().then(function() {
    game.init(context);
  });
});

