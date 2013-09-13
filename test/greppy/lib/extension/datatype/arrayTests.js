/**
 * Tests for lib/extension/datatype/array.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve('./');

describe('extensions for the array type', function() {
    
    before(function() {
        require(root + '/lib/extension/datatype/array');
    });
    
    describe('uniq', function() {
        it('should change the number of elements of an array which has duplicate values', function() {
            var myNums = [0, 1, 1, 2];
            var myVals = ['abc', 'def', 'ghj', 'ghj'];
            var mixed  = ['abc', 'def', 0, 'def', 0, 1];
            
            Array.uniq(myNums).length.should.equal(3);
            Array.uniq(myVals).length.should.equal(3);
            Array.uniq(mixed).length.should.equal(4);
        });
        
        it('should not change the number of elements of an array which has only unique values', function() {
            var myNums = [0, 1, 2];
            var myVals = ['yo', 'hi', 'test', 'kk'];
            
            Array.uniq(myNums).length.should.equal(3);
            Array.uniq(myVals).length.should.equal(4);
        });
        
        it('should remove duplicate values of an array which has duplicate values', function() {
            var myNums = [0, 1, 1, 2];
            var myVals = ['abc', 'def', 'ghj', 'ghj'];
            var mixed  = ['abc', 'def', 0, 'def', 0, 1];
            
            Array.uniq(myNums).should.include(0, 1, 2);
            Array.uniq(myVals).should.include('abc', 'def', 'ghj');
            Array.uniq(mixed).should.include('abc', 'def', 0, 1);
            Array.uniq(myNums).should.have.length(3);
            Array.uniq(myVals).should.have.length(3);
            Array.uniq(mixed).should.have.length(4);
        });
        
        it('should sort the values of a given array', function() {
            var myNums = [3, 4, 1, 2];
            var myVals = ['def', 'xyz', 'abc'];
            
            Array.uniq(myNums).should.eql([1, 2, 3, 4]);
            Array.uniq(myVals).should.eql(['abc', 'def', 'xyz']);
        });
    });
});
