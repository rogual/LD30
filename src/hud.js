var _ = require('lodash');
var assets = require('./assets');

exports.init = function(engine) {

  engine.addLayer(function(context, state) {

    if (state.won) {
      context.drawImage(assets.gfx.winner, 0, 0);
      return;
    }

    context.drawImage(assets.gfx.overlay, 0, 0);

    _.times(3, function(i) {

      var x = 14 + i * 45;
      var y = 5;

      if (state.itemIndex == i) {
        context.drawImage(assets.gfx['slot-on'], x, y);
      }
      else {
        context.drawImage(assets.gfx.slot, x, y);
      }

      if (state.items[i]) {
        context.drawImage(assets.gfx['ui-' + state.items[i]], x + 11, y + 10);
      }
    });


    _.times(6, function(i) {
      var x = state.stack[i] || 'nothing';
      context.drawImage(assets.gfx['ui-' + x], 284 + (6 - i - 1) * 17 , 13);
    });


    if (state.lost) {
      context.drawImage(assets.gfx['you-died'], 0, 0);
    }

  });

};
