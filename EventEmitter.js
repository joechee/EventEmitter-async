(function (window) {
    /**
     * Creates an instance of EventEmitter.
     * Every class that uses EventEmitter should inherit from this class.
     * This EventEmitter class is a little different in that it supports
     * async callbacks
     *
     * @constructor
     * @this {EventEmitter}
     */
    function EventEmitter() {
        if (this === window && EventEmitter._STRICT) {
            // Warn user if EventEmitter is applied to window
            // to catch issues such as:
            // var a = EventEmitter();
            throw new Error('EventEmitter applied to window!');
        } else {
            console.error('Warning: EventEmitter applied to window!');
        }
    }

    // EventEmitter flags
    EventEmitter._STRICT = false; // Throw errors instead of giving warnings
    EventEmitter._DEBUG = false;  // Debug if callbacks are not present


    /**
     * Registers an event to this EventEmitter. Can be chained
     * 
     * @param  {String}   event - Name of the event
     * @param  {Function} callback - Callback to be invoked upon event firing
     * @return {EventEmitter} - This EventEmitter
     */
    EventEmitter.prototype.on = function (event, callback) {
        if (!this._callbacks) {
            this._callbacks = {};
        }

        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }

        this._callbacks[event].push(callback);
        return this;
    };

    /**
     * Deregisters an event to this EventEmitter
     * 
     * @param  {String}   event - Name of the event
     * @param  {Function} callback - Callback to remove from list of events. 
     *                               If not given, remove all callbacks from
     *                               the event
     * @return {EventEmitter} - This EventEmitter
     */
    EventEmitter.prototype.off = function (event, callback) {
        if (!this._callbacks) {
            this._callbacks = {};
        }
        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }

        if (!callback) {
            this._callbacks[event] = [];
        } else if (this._callbacks[event].indexOf(callback) === -1) {
            throw new Error('Callback does not exist!');
        } else {
            this._callbacks[event] = this._callbacks[event].filter(function (x) {return x !== callback;});
        }
        return this;
    };
    
    /**
     * Registers an event to this EventEmitter, but only calls it once
     * 
     * @param  {String}   event - Name of the event
     * @param  {Function} callback - Callback to be invoked upon event firing
     * @return {EventEmitter} - This EventEmitter
     */
    EventEmitter.prototype.once = function (event, callback) {
        if (!this._callbacks) {
            this._callbacks = {};
        }
        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }
        var self = this;

        var wrappedFunction = function () {
            self._callbacks[event] = self._callbacks[event].filter(
                function (cb) {
                    return cb !== wrappedFunction;
                }
            );
            callback.apply(this, arguments);
        };

        wrappedFunction._originalArguments = getArgumentList(callback);

        this._callbacks[event].push(wrappedFunction);
        return this;
    };

    /**
     * Fires an event
     * @param  {String}   event - Name of event
     * @param  {[type]}   args - JSON Object containing arguments of function
     *                           (JSON object should have an (arg -> key)
     *                           mapping)
     * @param  {Function} callback - Callback to invoke after all callbacks
     *                               are invoked. Optional.
     * @return {undefined} - Cannot be chained since control passes to callback
     */
    EventEmitter.prototype.emit = function (event, args, callback) {
        if (!(callback instanceof Function)) {
            throw new Error('no callback');
        }
        var self = this;
        var wait = 0;
        var callbackCalled = false; // To make sure that callback is only   called once
        var withinEmit = true; // Make sure that all callbacks are asynchronous


        function checkDone() {
            if (wait === 0) {
                if (callbackCalled) {
                    throw new Error('Callback has already been invoked!');
                } else if (callback) {
                    callback();
                    callbackCalled = true;
                }
            } else if (wait < 0) {
                throw new Error('More callbacks called than necessary!');
            }
        }
        args.cb = args.callback = function () {
            // If callback is synchronous, withinEmit will still be true
            if (withinEmit && EventEmitter._STRICT) {
                throw new Error('Emit callback is not asynchronous!');
            } else {
                console.error('Warning: Emit callback is not asynchronous!');
            }
            wait--;
            checkDone();
        };

        if (!this._callbacks) {
            this._callbacks = {};
        }

        if (this._callbacks[event]) {
            this._callbacks[event].forEach(function (callback) {
                wait++;
            });

            this._callbacks[event].forEach(function (callback) {
                // Async callback
                runFunctionWithNamedArguments(callback, args);
            });
            if (!callbackCalled) {
                checkDone();
            }
        } else {
            checkDone();
        }

        // Test code
        if (EventEmitter._DEBUG) {
            setTimeout(function () {
                if (callbackCalled === false) {
                    console.log(event);
                    debugger;
                }
            }, 1000);
        }

        withinEmit = false;
    };

    /**
     * Given a function, return a array of strings of the arguments
     *
     * Modified from angularjs
     * @param  {Function} f
     * @return {Array[String]} 
     */
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    function getArgumentList(f) {
        if (!f._originalArguments) {
            var fString = f.toString().replace(STRIP_COMMENTS, '');
            var argsString = fString.match(FN_ARGS)[1];
            return argsString.split(FN_ARG_SPLIT).map(function (arg) {
                return arg.trim();
            });
        } else {
            return f._originalArguments;
        }
    }

    /**
     * Runs function f with named arguments
     * @param  {Function} f
     * @param  {Object} args
     * @return - Whatever the function f returns
     */
    function runFunctionWithNamedArguments(f, args) {
        var argsArray = [];
        var fArgumentList = getArgumentList(f);
        for (var key in args) {
            argsArray[fArgumentList.indexOf(key)] = args[key];
        }
        return f.apply(f, argsArray);
    }

    window.EventEmitter = EventEmitter;
})(window);