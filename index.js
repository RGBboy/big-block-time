/*!
 * Time System
 *
 * @note: All units are in milliseconds (the JS way)
 *
 * @todo: Add .step function
 * @todo: Add .replay function
 */

/**
 * Module Dependencies
 */

var EventEmitter = require('events').EventEmitter;

/**
 * Time System
 *
 * @param {Date} Date
 * @return {EventEmitter}
 * @api public
 */
exports = module.exports = function (Date) {

  // We need a way to be able to configure this

  var self = new EventEmitter(),
      fixedTimestep = 50,
      maxTimestep = 2000,
      renderTimestep = 1000/60, 
      paused = true,
      currentTime, // change name to less ambiguous
      fixedAccumulator,
      renderAccumulator;

  self.deltaTime = 0;

  function loop () {
    if (!paused) {
      // should update to support window.performance.now if supported?
      var newTime = Date.now(),
          frameTime = newTime - currentTime;

      if (frameTime > maxTimestep) {
        self.pause();
        //frameTime = maxFrameTime;
        console.log('!!!Spiral Of Death!!!');
      };

      currentTime = newTime;
      fixedAccumulator += frameTime;

      // Run as many Fixed Updates until fixedAccumulator < fixedTimestep
      while (fixedAccumulator >= fixedTimestep) {
        self.deltaTime = fixedTimestep;
        self.emit('fixedupdate', self);
        fixedAccumulator -= fixedTimestep;
      };

      // Run single update and render if renderAccumulator >= renderTimestep
      renderAccumulator += frameTime;
      if (renderAccumulator >= renderTimestep) {
        //alpha = accumulator / renderTimestep;
        // state = currentState*alpha + previousState * ( 1 - alpha );
        self.deltaTime = renderAccumulator;
        self.emit('update', self);
        self.emit('render', self);
        renderAccumulator = 0;
      };

      process.nextTick(loop);
    };
  };

  self.start = function () {
    paused = false;
    currentTime = Date.now();
    fixedAccumulator = 0;
    renderAccumulator = 0;
    self.emit('start');
    process.nextTick(loop);
  };

  self.stop = function () {
    self.pause(); // change this or remove stop fn.
    self.emit('stop');
  };

  self.pause = function () {
    paused = !paused;
    self.emit('pause');
  };

  return self;

};