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
    sandbox,
    time;

/**
 * Setup
 */

var setup = function (t) {
  clock = sinon.useFakeTimers(0, 'Date');
  sandbox = sinon.sandbox.create();
  time = Time(Date);
};

/**
 * Teardown
 */

var teardown = function (t) {
  sandbox.restore();
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

test('time.start should start time running', function (t) {
  var count = 1,
      step = 100;
  function loop () {
    if (count === 3) {
      t.equal(time.tick.callCount, 3);
      t.equal(time.tick.firstCall.args[0], 0);
      t.equal(time.tick.secondCall.args[0], step);
      t.equal(time.tick.thirdCall.args[0], step);
      time.stop();
      teardown(t);
      return;
    };
    count += 1;
    clock.tick(step);
    setImmediate(loop);
  };
  setup(t);
  sandbox.spy(time, 'tick');
  t.plan(4);
  time.start();
  setImmediate(loop);
});

test('when time is running and tick takes longer than maxTimestep, time should stop running', function (t) {
  var count = 1,
      step = maxTimestep + 1;
  function loop () {
    if (count === 3) {
      t.equal(time.tick.callCount, 2);
      t.equal(time.tick.firstCall.args[0], 0);
      t.equal(time.tick.secondCall.args[0], step);
      teardown(t);
      return;
    };
    count += 1;
    clock.tick(step);
    setImmediate(loop);
  };
  setup(t);
  sandbox.spy(time, 'tick');
  t.plan(3);
  time.start();
  setImmediate(loop);
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

test('time should emit a stop event when stop is called', function (t) {
  setup(t);
  t.plan(1);
  time.once('stop', function () {
    t.pass('stop fired');
    teardown(t);
  });
  time.stop();
});

test('time.stop should stop time running', function (t) {
  var count = 1,
      step = 100;
  function loop () {
    if (count === 2) {
      time.stop();
    };
    if (count === 3) {
      t.equal(time.tick.callCount, 2);
      t.equal(time.tick.firstCall.args[0], 0);
      t.equal(time.tick.secondCall.args[0], step);
      teardown(t);
      return;
    };
    count += 1;
    clock.tick(100);
    setImmediate(loop);
  };
  setup(t);
  sandbox.spy(time, 'tick');
  t.plan(3);
  time.start();
  setImmediate(loop);
});

test('calling time.stop when time is stopped should not start time', function (t) {
  var count = 1,
      step = 100;
  function loop () {
    if (count === 2) {
      time.stop();
      time.stop();
    };
    if (count === 3) {
      t.equal(time.tick.callCount, 2);
      t.equal(time.tick.firstCall.args[0], 0);
      t.equal(time.tick.secondCall.args[0], step);
      teardown(t);
      return;
    };
    count += 1;
    clock.tick(100);
    setImmediate(loop);
  };
  setup(t);
  sandbox.spy(time, 'tick');
  t.plan(3);
  time.start();
  setImmediate(loop);
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