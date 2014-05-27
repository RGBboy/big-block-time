# Big Block Time

A time system for the Big Block game engine.

[![Browser Support](https://ci.testling.com/rgbboy/big-block-time.png)
](https://ci.testling.com/RGBboy/big-block-time)

[![Build Status](https://secure.travis-ci.org/RGBboy/big-block-time.png)](http://travis-ci.org/RGBboy/big-block-time)

## API

### .deltaTime

The time in milliseconds since the last event of type fired.

### .tick()

Runs a single tick for time passed, emitting fixedupdate, update and 
render events.

### .start()

Starts the loop

### .stop()

Starts the loop

## Events

### start

* Fired when time starts looping

### stop

* Fired when time stops looping

### fixedupdate

* Deterministic
* Always fired x times when `time since started / fixedTimeStep = x`

### update

* Non deterministic
* Fired as close to the framerate as possible.

### render

* Non deterministic
* Fired after the update event

## To Do

* configuration
* Alpha for update and render event for interpolation
* Add .replay or .rewind function

## License 

(The MIT License)

Copyright (c) 2014 RGBboy &lt;l-_-l@rgbboy.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.