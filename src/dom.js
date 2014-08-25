
exports.disableAntiAliasing = function(canvas) {
  ['-webkit-', '-moz-', '-o-', '-ms-', ''].forEach(function(prefix) {
    canvas.style.imageRendering = prefix + 'optimize-contrast';
  });

  canvas.style.imageRendering = 'pixelated';

  canvas.style['-ms-interpolation-mode'] = 'nearest-neighbor';
};
