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
 * fixedupdate event
 */

test('time should fire fixedupdate event with deltaTime === fixedTimestep, when frame takes fixedTimestep', function (t) {
  setup(t);
  t.plan(2);
  time.on('fixedupdate', function (data) {
    t.pass('fire fixedupdate');
    t.equal(data.deltaTime, fixedTimestep);
    time.stop();
    teardown(t);
  });
  time.start();
  clock.tick(fixedTimestep);
});

test('time should not fire fixedupdate event when frame takes less than fixedTimestep', function (t) {
  function fail () {
    t.fail();
    t.end();
    time.stop();
    teardown(t);
  };
  function pass () {
    t.pass();
    t.end();
    time.stop();
    teardown(t);
  };
  setup(t);
  time.on('fixedupdate', fail);
  time.start();
  clock.tick(fixedTimestep/2);
  setImmediate(function () {
    time.removeListener('fixedupdate', fail);
    time.on('fixedupdate', pass);
    clock.tick(fixedTimestep/2);
  });
});

test('time should fire fixedupdate event with deltaTime === fixedTimestep when frame takes more than fixedTimestep', function (t) {
  setup(t);
  t.plan(2);
  time.on('fixedupdate', function (data) {
    t.pass('fire fixedupdate');
    t.equal(data.deltaTime, 50);
    time.stop();
    teardown(t);
  });
  time.start();
  clock.tick(fixedTimestep + fixedTimestep/2);
});

/**
 * update event
 */

test('time should fire update with deltaTime === time since last update when frame takes renderTimestep', function (t) {
  setup(t);
  t.plan(2);
  time.on('update', function (data) {
    t.pass('fire update');
    t.equal(data.deltaTime, renderTimestep);
    time.stop();
    teardown(t);
  });
  time.start();
  clock.tick(renderTimestep);
});


test('time should fire update event with deltaTime === frameTime when frame takes longer than renderTimestep', function (t) {
  var step = renderTimestep + renderTimestep/2;
  setup(t);
  t.plan(2);
  time.on('update', function (data) {
    t.pass('fire update');
    t.equal(data.deltaTime, step);
    time.stop();
    teardown(t);
  });
  time.start();
  clock.tick(step);
});

test('time should not fire update event when frame takes shorter than renderTimestep', function (t) {
  function fail () {
    t.fail();
    t.end();
    time.stop();
    teardown(t);
  };
  function pass () {
    t.pass();
    t.end();
    time.stop();
    teardown(t);
  };
  setup(t);
  time.on('update', fail);
  time.start();
  clock.tick(renderTimestep/2);
  setImmediate(function () {
    time.removeListener('update', fail);
    time.on('update', pass);
    clock.tick(renderTimestep/2);
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
    time.stop();
    teardown(t);
    t.end();
  });
  time.start();
  clock.tick(fixedTimestep);
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
    time.stop();
    teardown(t);
    t.end();
  });
  time.start();
  clock.tick(renderTimestep);
});