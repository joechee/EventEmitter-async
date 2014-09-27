EventEmitter
============

Yet another EventEmitter implementation.

## Quick Examples
```javascript

var SubClass = function () {};
SubClass.prototype = new EventEmitter();

var instance = new SubClass();
instance.on('some-event', function (namedArg1, namedArg2, callback) {
    ...
    callback(); // This should be asynchronous according to node best practices
})

instance.emit('some-event', {namedArg1: 'hello', namedArg2: 'world'}, function () {
    // This code will be invoked after all previous callbacks are completes 
});

```


Note: Callbacks should be either be 100% synchronous/ 100% asynchronous according to node best practices (http://nodejs.org/api/process.html#process_process_nexttick_callback). This EventEmitter implementation tries to be 100% async and will throw warnings if not followed.


### Test

To run browser tests, open `test.html`.

### Install via bower

`bower install eventemitter-async --save`

