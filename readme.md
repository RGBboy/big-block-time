# Big Block Time

A time system for the Big Block game engine.

## API

###.start()

Starts the loop

###.stop()

Starts the loop

###.pause()

Pauses the loop. When resumed the number of fixed updates during paused will fire.

## Events

### fixedupdate

* deterministic
* Always fired x times when `time since started / fixedTimeStep = x`

### update

* Non deterministic
* Fired as close to the framerate as possible.

### render

Fired after the update event

## To Do

* configuration via provider
* Alpha for update and render event for interpolation

### Tests

* start function
* start event
* stop function
* stop event
* paused function
* paused events