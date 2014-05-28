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

  var self = new EventEmitter(),
      fixedTimestep = 50,
      maxTimestep = 2000,
      renderTimestep = 1000/60, 
      stopped = true,
      lastTime,
      fixedAccumulator = 0,
      renderAccumulator = 0;

  self.deltaTime = 0;

  function loop () {
    if (!stopped) {

      var newTime = Date.now(),
          frameTime = newTime - lastTime;

      // spriral of death (frame of work is taking longer than maxTimestep)
      if (frameTime > maxTimestep) {
        self.stop();
      };

      lastTime = newTime;
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
    // Run as many Fixed Updates until fixedAccumulator < fixedTimestep
    fixedAccumulator += time;
    while (fixedAccumulator >= fixedTimestep) {
      self.deltaTime = fixedTimestep;
      self.emit('fixedupdate', self);
      fixedAccumulator -= fixedTimestep;
    };

    // Run single update and render if renderAccumulator >= renderTimestep
    renderAccumulator += time;
    if (renderAccumulator >= renderTimestep) {
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
    lastTime = Date.now();
    fixedAccumulator = 0;
    renderAccumulator = 0;
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