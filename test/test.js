var chai = require('chai');
var expect =  require('chai').expect;
var Promised = require('../src/promises').promised


describe('a promise test', function() {

  it('resolves a promise with a new constructor', function(done) {
    function myFirstPromise(){
      return new Promised(function(resolve, reject){
        setTimeout(function(){
          resolve('Success!');
          done();
        }, 100);
      });
    }

    return myFirstPromise().then(function(successMessage) {
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
  })

  it('should reject', function() {
    return promiseTest()
      .then(function(err) {
        expect(promiseTest).to.throw(Error, 'Uhh param?');
      });
  })
});
