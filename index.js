/*!
 * Time System
 *
 * @note: All time related units are in milliseconds
 *
 */

/**
 * Polyfills
 */

require('setimmediate');

/**
 * Module Dependencies
 */

var Time,
    di = require('big-block').di,
    Date = require('big-block-date'),
    EventEmitter = require('events').EventEmitter;

/**
 * Time System
 *
 * @param {Date} Date
 * @return {EventEmitter}
 * @api public
 */
Time = function (Date) {

  // We need a way to be able to configure this

  var self = new EventEmitter(),
      fixedTimestep = 50,
      maxTimestep = 2000,
      renderTimestep = 1000/60, 
      stopped = true,
      currentTime, // change name to less ambiguous
      fixedAccumulator = 0,
      renderAccumulator = 0;

  self.deltaTime = 0;

  function loop () {
    if (!stopped) {
      // should update to support window.performance.now if supported?
      var newTime = Date.now(),
          frameTime = newTime - currentTime;

      if (frameTime > maxTimestep) {
        self.pause();
        //frameTime = maxFrameTime;
        console.log('!!!Spiral Of Death!!!');
      };

      currentTime = newTime;
      self.tick(frameTime);

      setImmediate(loop);
    };
  };

  /**
   * .tick
   *
   * Runs a single tick for time passed, emitting fixedupdate, update and 
   * render events
   *
   * @param {Number} time
   * @return {undefined}
   * @api public
   */
  self.tick = function (time) {
    fixedAccumulator += time;

    // Run as many Fixed Updates until fixedAccumulator < fixedTimestep
    while (fixedAccumulator >= fixedTimestep) {
      self.deltaTime = fixedTimestep;
      self.emit('fixedupdate', self);
      fixedAccumulator -= fixedTimestep;
    };

    // Run single update and render if renderAccumulator >= renderTimestep
    renderAccumulator += time;
    if (renderAccumulator >= renderTimestep) {
      //alpha = accumulator / renderTimestep;
      // state = currentState*alpha + previousState * ( 1 - alpha );
      self.deltaTime = renderAccumulator;
      self.emit('update', self);
      self.emit('render', self);
      renderAccumulator = 0;
    };
  };

  /**
   * .start
   *
   * starts repeated calls to tick
   *
   * @return {undefined}
   * @api public
   */
  self.start = function () {
    stopped = false;
    currentTime = Date.now();
    self.emit('start');
    setImmediate(loop);
  };

  /**
   * .stop
   *
   * stops repeated calls to tick
   *
   * @return {undefined}
   * @api public
   */
  self.stop = function () {
    stopped = true;
    self.emit('stop');
  };

  return self;

};

/**
 * Dependency Annotation
 */

di.annotate(Time, new di.Inject(Date));

/**
 * Module Exports
 */
exports = module.exports = Time;