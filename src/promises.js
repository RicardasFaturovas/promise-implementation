// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~ PROMISE IMPLEMENTATION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var exports = module.exports = {};

function Promised(fn) {

  //Enum of promise states
  var promisedState = {
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2
  }

  // store state which can be PENDING, ACCEPTED or rejected
  var state = promisedState.PENDING;

  // store value once ACCEPTED or rejected
  var value = null;

  // store sucess & failure handlers
  var handlers = [];

  // function to be launched when the promise is fullfilled
  // function fulfill(result) {
  //   state = promisedState.ACCEPTED;
  //   value = result;
  //   handlers.forEach(handle);
  //   handlers = null;
  // }

  // function to be launched when the promise is rejected
  function reject(error) {
    state = promisedState.REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

	function changeState(newState, result) {
		state = newState;
		value = result;
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
      changeState(promisedState.ACCEPTED, result);
    } catch (err) {
      changeState(promisedState.REJECTED, err);
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
      fn(function(value) {
        if (done) return
        done = true
        onAccepted(value)
      }, function(reason) {
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
  // (onAccepted or onRejected)
  function handle(handler) {
    if (state === promisedState.PENDING) {
      handlers.push(handler);
    } else {
      if (state === promisedState.ACCEPTED && typeof handler.onAccepted === 'function') {
        handler.onAccepted(value);
      }
      if (state === promisedState.REJECTED && typeof handler.onRejected === 'function') {
        handler.onRejected(value);
      }
    }
  }

  // Done implementation. Takes 2 handlers and uses handle function on both
  this.done = function(onAccepted, onRejected) {
    // this ensures asynchronousy of the code
    setTimeout(function() {
      handle({
        onAccepted: onAccepted,
        onRejected: onRejected
      });
    }, 0);
  }

  // Finally resolves the promise by taking the original function
  // and the 2 handlers: fullfilled and rejected
  resolvePromise(fn, resolve, reject);
}

// Then method implementation
// basically same as done but instead returns a new promise, which can be
// resolved or rejected
Promised.prototype.then = function(onAccepted, onRejected) {
  var _this = this;
  return new Promised(function(resolve, reject) {
    return _this.done(function(result) {
      if (typeof onAccepted === 'function') {
        try {
          return resolve(onAccepted(result));
        } catch (err) {
          return reject(err);
        }
      } else {
        return resolve(result);
      }
    }, function(error) {
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
};

// Catch implementation. Same usage as the then method but only works with
// rejected promises. Passes undefined as onAccepted condition.
Promised.prototype.catch = function(onRejected) {
  var _this = this;
	return Promised.prototype.then.call(this,undefined,onRejected);
}

Promised.resolve = function(promise) {
  return new Promised(function(resolve, reject) {
    resolve(promise);
  });
}

Promised.reject = function(promise) {
  return new Promised(function(resolve, reject) {
    reject(promise);
  });
}

// Promise.all implementation. Takes an array of promises, resolves them one by
// one and pushes them all to a new array, if any of the promises rejects, the
// merged array also rejects, otherwise it gets fulfilled
Promised.all = function(promises) {
  var results = []
  var remainingPromises = promises.length;
  if (!remainingPromises) {
    return Promised.resolve(results)
  }
  return new Promised(function(resolve, reject) {
    promises.forEach(function(promise, index) {
      Promised.resolve(promise).then(function(result) {
        results[index] = result
        remainingPromises -= 1
        if (remainingPromises === 0) {
          resolve(results)
        }
      }, reject)
    })
  })
};

Promised.race = function(promises) {
  return new Promised(function(resolve, reject) {
    console.log(promises)
    promises.forEach(function(promise) {
      Promised.resolve(promise).then(resolve).catch(reject);
    })
  })
};

var promised = Promised;
exports.promised = promised;
