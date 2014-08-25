var Q = require('q');
var _ = require('lodash');


exports.loadImage = function(name) {
  var deferred = Q.defer();

  var url = 'assets/' + name + '.png';
  var image = new Image();

  image.name = name;

  image.addEventListener('load', function() {
    deferred.resolve(image);
  });

  image.src = url;

  return deferred.promise;
};

exports.loadImages = function(names) {
  return Q.all(_.map(names, exports.loadImage))
    .then(function(images) { return _.indexBy(images, 'name'); });
};

exports.loadAll = function() {
  return exports.loadImages(require('../gen/files')).then(function (gfx) {
    exports.gfx = gfx;
  });
};
