/*!
 * Time unit tests
 */

/**
 * Module Dependencies
 */

var test = require('tape'),
    sinon = require('sinon'),
    Time = require('../index'),
    fixedTimestep = 50,
    maxTimestep = 2000,
    renderTimestep = 1000/60,
    clock,
    time;

/**
 * Setup
 */

var setup = function (t) {
  clock = sinon.useFakeTimers(0, 'Date'),
  time = Time(Date);
};

/**
 * Teardown
 */

var teardown = function (t) {
  clock.restore();
};

/**
 * Time Class
 */

test('Time', function (t) {
  t.plan(1);
  t.ok(Time, 'class should exist');
});

/**
 * time.tick
 */

test('time.tick should be a function', function (t) {
  setup(t);
  t.plan(1);
  t.equal(typeof time.tick, 'function');
  teardown(t);
});

test('time.tick(x) should emit the correct events in the correct order', function (t) {
  var events = [];
  function fixedUpdate () {
    events.push('fixedupdate');
  };
  function update () {
    events.push('update');
  };
  function render () {
    events.push('render');
  };
  setup(t);
  t.plan(1);
  time.on('fixedupdate', fixedUpdate);
  time.on('update', update);
  time.on('render', render);
  time.tick(fixedTimestep/2);
  time.tick(fixedTimestep/2);
  time.tick(fixedTimestep*2);
  t.deepEqual(events, ['update', 'render', 'fixedupdate', 'update', 'render', 'fixedupdate', 'fixedupdate', 'update', 'render']);
  teardown(t);
});

/**
 * time.start
 */

test('time.start should be a function', function (t) {
  setup(t);
  t.plan(1);
  t.equal(typeof time.start, 'function');
  teardown(t);
});

test('time should emit a start event when start is called', function (t) {
  setup(t);
  t.plan(1);
  time.once('start', function () {
    t.pass('start fired');
    time.stop();
    teardown(t);
  });
  time.start();
});

/**
 * time.stop
 */

test('time.stop should be a function', function (t) {
  setup(t);
  t.plan(1);
  t.equal(typeof time.stop, 'function');
  teardown(t);
});

test('calling time.stop when time is stopped should not start time', function (t) {
  var fail = function () {
    t.fail('update event fired');
    t.end();
    time.stop();
    teardown(t);
  };
  setup(t);
  t.plan(1);
  time.start();
  time.stop();
  time.on('update', fail);
  clock.tick(renderTimestep);
  time.stop();
  t.pass('update event not fired');
  teardown(t);
});

test('time should emit a stop event when stop is called', function (t) {
  setup(t);
  t.plan(1);
  time.once('stop', function () {
    t.pass('stop fired');
    teardown(t);
  });
  time.stop();
});

/**
 * fixedupdate event
 */

test('time should fire fixedupdate event with deltaTime === fixedTimestep, when tick takes fixedTimestep', function (t) {
  setup(t);
  t.plan(2);
  time.on('fixedupdate', function (data) {
    t.pass('fire fixedupdate');
    t.equal(data.deltaTime, fixedTimestep);
    teardown(t);
  });
  time.tick(fixedTimestep);
});

test('time should not fire fixedupdate event when tick takes less than fixedTimestep', function (t) {
  function fail () {
    t.fail('fixedupdate event fired');
    t.end();
    teardown(t);
  };
  function pass () {
    t.pass('fire fixedupdate');
    t.end();
    teardown(t);
  };
  setup(t);
  time.on('fixedupdate', fail);
  time.tick(fixedTimestep/2);
  setImmediate(function () {
    time.removeListener('fixedupdate', fail);
    time.on('fixedupdate', pass);
    time.tick(fixedTimestep/2);
  });
});

test('time should fire multiple fixedupdate event with deltaTime === fixedTimestep when tick takes multiple fixedTimestep', function (t) {
  setup(t);
  t.plan(6);
  time.on('fixedupdate', function (data) {
    t.pass('fire fixedupdate');
    t.equal(data.deltaTime, 50);
  });
  time.tick(3*fixedTimestep);
  teardown(t);
});


test('time should fire fixedupdate event with deltaTime === fixedTimestep when tick takes more than fixedTimestep', function (t) {
  setup(t);
  t.plan(2);
  time.on('fixedupdate', function (data) {
    t.pass('fire fixedupdate');
    t.equal(data.deltaTime, 50);
    teardown(t);
  });
  time.tick(fixedTimestep + fixedTimestep/2);
});

/**
 * update event
 */

test('time should fire update with deltaTime === time since last update when tick takes renderTimestep', function (t) {
  setup(t);
  t.plan(2);
  time.on('update', function (data) {
    t.pass('fire update');
    t.equal(data.deltaTime, renderTimestep);
    teardown(t);
  });
  time.tick(renderTimestep);
});

test('time should fire single update event with deltaTime === frameTime when tick takes multiple renderTimestep', function (t) {
  var step = 3 * renderTimestep;
  setup(t);
  t.plan(2);
  time.on('update', function (data) {
    t.pass('fire update');
    t.equal(data.deltaTime, step);
    teardown(t);
  });
  time.tick(step);
});

test('time should fire single update event with deltaTime === frameTime when tick takes longer than renderTimestep', function (t) {
  var step = renderTimestep + renderTimestep/2;
  setup(t);
  t.plan(2);
  time.on('update', function (data) {
    t.pass('fire update');
    t.equal(data.deltaTime, step);
    teardown(t);
  });
  time.tick(step);
});

test('time should not fire update event when tick takes shorter than renderTimestep', function (t) {
  function fail () {
    t.fail('update event fired');
    t.end();
    teardown(t);
  };
  function pass () {
    t.pass('fire update');
    t.end();
    teardown(t);
  };
  setup(t);
  time.on('update', fail);
  time.tick(renderTimestep/2);
  setImmediate(function () {
    time.removeListener('update', fail);
    time.on('update', pass);
    time.tick(renderTimestep/2);
  });
});

test('time should fire update event after fixedupdate event', function (t) {
  var step = 0;
  setup(t);
  time.on('fixedupdate', function (data) {
    step += 1;
    t.equal(step, 1);
  });
  time.on('update', function (data) {
    step += 1;
    t.equal(step, 2);
    teardown(t);
    t.end();
  });
  time.tick(fixedTimestep);
});

/**
 * render event
 */

test('time should fire render event after update event', function (t) {
  var step = 0;
  setup(t);
  time.on('update', function (data) {
    step += 1;
    t.equal(step, 1);
  });
  time.on('render', function (data) {
    step += 1;
    t.equal(step, 2);
    teardown(t);
    t.end();
  });
  time.tick(renderTimestep);
});