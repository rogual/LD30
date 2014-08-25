

exports.init = function(engine) {

  engine.state.anims = [];

  engine.addProcess(function(dt, state) {

    state.anims.forEach(function(anim) {

      anim.timer = (anim.timer + dt) % anim.duration;

      var frameNo = Math.floor(
        anim.frames.length * (anim.timer / anim.duration)
      );

      var frame = anim.frames[frameNo];

      anim.sprite.image = frame;


    });


  });


};
