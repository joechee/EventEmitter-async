describe('EventEmitter', function(){
  describe('#on()', function() {
    var test = new EventEmitter();
    function eventFired(cb) {
        assert(!eventFired.flag);
        eventFired.flag = true;
        setTimeout(cb, 0);
    }
    it('should register the function without error', function(done){
        test.on('event-one', eventFired);
        done();
    });
    it('should fire the event-fired callback before calling the actual callback', function(done){
        test.emit('event-one', {}, function () {
            assert(eventFired.flag);
            done();
        });
    });

    it('should not crash when there are no callbacks to be fired', function(done){
        test.emit('empty', {}, done);
    });


    var counter = 0;
    function fireEventTwo(cb) {
        counter++;
        setTimeout(cb, 0);
    }
    it('should be able to fire the event multiple times to invoke callbacks multiple times', function(done){
        test.on('event-two', fireEventTwo);
        test.emit('event-two', {}, function () {
            test.emit('event-two', {}, function () {
                assert(counter === 2);
            });
        });
        done();
    });

    function fireEventThree(hello, cb) {
        fireEventThree.string = hello;
        setTimeout(cb, 0);
    }
    it('should be able to pass arguments to the event fired', function(done){
        test.on('event-three', fireEventThree);
        test.emit('event-three', {hello:'world'}, function () {
            assert.equal(fireEventThree.string, 'world');
        });
        done();
    });


  });

  describe('#once()', function(){
    var test = new EventEmitter();
    function eventFired(cb) {
        assert(!eventFired.flag);
        eventFired.flag = true;
        setTimeout(cb, 0);
    }
    it('should register the function without error', function(done){
        test.once('event-fired', eventFired);
        done();
    });
    it('should fire the event-fired callback before calling the actual callback', function(done){
        test.emit('event-fired', {}, function () {
            assert(eventFired.flag);
            done();
        });
    });

    it('should not fire the event-fired callback again', function(done){
        test.emit('event-fired', {}, function () {
            assert(eventFired.flag);
            done();
        });
    });
  });
});