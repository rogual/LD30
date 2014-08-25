var _ = require('lodash');

var stuff = {};
var el;

exports.set = function(x, y) {
  //stuff[x] = y;
  //update();
};

exports.setj = function(x, y) {
  //exports.set(x, JSON.stringify(y));
};

function update() {
  if (!el) {
    el = document.createElement('div');
    el.style.whiteSpace = 'pre';
    //document.body.appendChild(el);
  }


  var txt = '';
  _.forEach(stuff, function(v, k) {
    txt += k + ': ' + v + '\n';
  });
  el.textContent = txt;
}
