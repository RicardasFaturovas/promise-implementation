// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~ PROMISE IMPLEMENTATION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var exports = module.exports = {};

exports.promised = function Promised(fn) {
	// done for further readability of code
	var pending = 0;
	var accepted = 1;
	var rejected = 2;

	// store state which can be pending, accepted or rejected
	var state = pending;

	// store value once accepted or rejected
	var value = null;

	// store sucess & failure handlers
	var handlers = [];

	// function to be launched when the promise is fullfilled
  function fulfill(result) {
    state = accepted;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }

	// function to be launched when the promise is rejected
  function reject(error) {
    state = rejected;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

	// Checks whether the result is a value or a promise. Accepts either a promise
	// or a value and if promise waits for it to be resolved
	// (launches resolvePromise)
  function resolve(result) {
    try {
      var then = getThen(result);
      if (then) {
        resolvePromise(then.bind(result), resolve, reject)
        return
      }
      fulfill(result);
    } catch (err) {
      reject(err);
    }
  }

	// Checks and returns the then method of the promise
	function getThen(value) {
		if (value && (typeof value === 'object' || typeof value === 'function')) {
			if (typeof value.then === 'function') {
				return value.then;
			}
		}
		return null;
	}

	// Resolve implementation. Takes the original function and 2 handler functions
	// then fires the function by passing 2 functions which check for completion
	// and fire the handler functions
	function resolvePromise(fn, onAccepted, onRejected) {
		 var done = false;
		 try {
		   fn(function (value) {
		     if (done) return
		     done = true
		     onAccepted(value)
	    }, function (reason) {
		     if (done) return
		     done = true
		     onRejected(reason)
		   })
		 } catch (err) {
		  	if (done) return
	    	done = true
		  	onRejected(err)
		 	}
	}

	// Handle implementation. First pushes the handlers to the array
	// then depening on the promise state fires handle methods
	// (onAccepted oronRejected)
  function handle(handler) {
    if (state === pending) {
      handlers.push(handler);
    } else {
      if (state === accepted && typeof handler.onAccepted === 'function') {
        handler.onAccepted(value);
      }
      if (state === rejected && typeof handler.onRejected === 'function') {
        handler.onRejected(value);
      }
    }
  }

	// Done implementation. Takes 2 handlers and uses handle function on both
  this.done = function (onAccepted, onRejected) {
    // this ensures asynchronousy of the code
    setTimeout(function () {
      handle({
        onAccepted: onAccepted,
        onRejected: onRejected
      });
    }, 0);
  }


	// Then method impplementation
	// basically same as done but instead returns a new promise, which can be
	// resolved or rejected
	this.then = function (onAccepted, onRejected) {
    var _this = this;
    return new Promised(function (resolve, reject) {
      return _this.done(function (result) {
        if (typeof onAccepted === 'function') {
          try {
            return resolve(onAccepted(result));
          } catch (err) {
            return reject(err);
          }
        } else {
          return resolve(result);
        }
      }, function (error) {
        if (typeof onRejected === 'function') {
          try {
            return resolve(onRejected(error));
          } catch (err) {
            return reject(err);
          }
        } else {
          return reject(error);
        }
      });
    });
  }

	// Finally resolves the promise by taking the original function
	// and the 2 handlers: fullfilled and rejected
  resolvePromise(fn, resolve, reject);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TESTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var Promised = require('../src/promises.js').promised;
var myFirstPromise = new Promised(function(resolve, reject){
  setTimeout(function(){
    resolve("Success!"); //Yay! Everything went well!
  }, 2000);
});

myFirstPromise.then(function(successMessage){
  console.log("Yay! " + successMessage);
}).then(function(){
  console.log("Yay for the second time!");
});
