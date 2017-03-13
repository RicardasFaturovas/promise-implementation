var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var Promised = require('../src/promises').promised;


describe('a promise test', function() {

  it('resolves a promise with a new constructor', function() {
    var myFirstPromise = new Promised(function(resolve, reject){
      setTimeout(function(){
        resolve('Success!');
      }, 1000);
    });

  return myFirstPromise.then(function(successMessage) {
      expect(successMessage).to.equal('Success!');
    });
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
    });
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
    });
  });

  var p1 = Promised.resolve(3);
  var p2 = 1337;
  var p3 = new Promised(function (resolve, reject) {
  	setTimeout(function(){
      resolve("foo");
    }, 100);
  });
  var p4 = new Promised(function(resolve, reject){
  	setTimeout(reject, 50, 'baz');
  });

  it('should resolve all promises',function(){
    return Promised.all([p1, p2, p3]).then(function(values) {
      expect(values).to.be.deep.equal([3,1337,'foo']);
    });
  });

  it('should reject the promise',function() {
    return expect(Promised.all([p1, p2, p4])).to.be.rejected;
  });

  it('should resolve the second promise first',function(){
    var pr1 = new Promised(function(res, rej) {
      setTimeout(res, 100, 'foo');
    });

    var pr2 = new Promised(function(res, rej){
       setTimeout(res, 10, 'bar');
    });

    return Promised.race([pr1, pr2]).then(function(result){
      expect(result).to.be.equal('bar');
    });
  });

  it('should reject the promise with baz',function(){
    var pr1 = new Promised(function(res, rej) {
      setTimeout(res, 2000, 'foo');
    });

    var pr2 = new Promised(function(res, rej){
       setTimeout(rej, 10, 'baz');
    });

    return expect(Promised.race([pr1, pr2])).to.be.rejectedWith('baz');
  });

});
