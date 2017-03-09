var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var Promised = require('../src/promises').promised


describe('a promise test', function() {

  it('resolves a promise with a new constructor', function() {
    var myFirstPromise = new Promised(function(resolve, reject){
      setTimeout(function(){
        resolve('Success!');
      }, 1000);
    });

  return myFirstPromise.then(function(successMessage) {
      expect(successMessage).to.equal('Success!');
    })
  });

  function promiseTest(param) {
    return new Promised(function(resolve, reject) {
      if(param) {
        return resolve('BOOYAH!');
      }
      return reject('Uhh param?');
    });
  }

  it('should resolve', function(){
    return promiseTest('param')
      .then(function(result) {
        expect(result).to.equal('BOOYAH!');
      });
  });

  it('should reject', function() {
    expect(promiseTest()).to.be.rejectedWith('Uhh param?');
  });

  it('should chain', function(done) {
    (new Promised(function(resolve, fail) {
      setTimeout(resolve, 100, ['success']);
    }))
    .then(function(result) {
      return String(result).toUpperCase();
    })
    .then(function(result) {
      expect(result).to.be.equal('SUCCESS');
      done();
    })
  });

  it('should chain', function(done) {
    (new Promised(function(resolve, fail) {
      setTimeout(resolve, 100, ['success']);
    }))
    .then(function(result) {
      return new Promised(function(resolve) {
        resolve(String(result).toUpperCase());
      });
    })
    .then(function(result) {
      expect(result).to.be.equal('SUCCESS');
      done();
    })
  });
});
