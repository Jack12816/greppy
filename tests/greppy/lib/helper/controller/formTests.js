/**
 * Tests for /lib/helper/controller/form
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve(__dirname + '/../../../../../');
var Form   = require(root + '/lib/helper/controller/form');
var fm     = null;

describe('FormHelper', function () {

    beforeEach(function() {
        fm = new Form();
    });

    describe('sanitizeList', function() {

        it('should remap a scalar value into an array', function() {

            var result1 = fm.sanitizeList('joo')
            var result2 = fm.sanitizeList(1234);

            result1.should.be.an.instanceOf(Array);
            result1.should.have.length(1);
            result1[0].should.be.a.String;
            result1[0].should.equal('joo');

            result2.should.be.an.instanceOf(Array);
            result2.should.have.length(1);
            result2[0].should.be.a.Number;
            result2[0].should.equal(1234);
        });

        it('should not remap an array', function() {

            var result = fm.sanitizeList(['meow', 32]);

            result.should.be.an.instanceOf(Array);
            result.should.have.length(2);
            result[0].should.be.a.String;
            result[0].should.equal('meow');
            result[1].should.be.a.Number;
            result[1].should.equal(32);
        });

    });

    describe('sanitizeIntegerList', function () {

        it('should convert an array with string numbers to an array with numbers only of type number', function() {

            var result1 = fm.sanitizeIntegerList(['32', '16', '8', '4', '2']);
            var result2 = fm.sanitizeIntegerList([64, 128, '16']);

            result1.should.have.length(5);
            result1.should.include(32);
            result1.should.include(16);
            result1.should.include(8);
            result1.should.include(4);
            result1.should.include(2);

            result2.should.have.length(3);
            result2.should.include(64);
            result2.should.include(128);
            result2.should.include(16);
        });

        it('should convert float numbers in lists to integers', function() {

            var result = fm.sanitizeIntegerList([2.34, 3.12, 4.6]);

            result.should.have.length(3);
            result.should.include(2);
            result.should.include(3);
            result.should.include(4);
        });

        it('should convert a single string number to an array with one element of type number', function() {

            var result = fm.sanitizeIntegerList('1234');

            result.should.eql([1234]);
            result[0].should.be.a.Number;
        });

        it('should return an empty array if an empty array was passed', function() {

            fm.sanitizeIntegerList([]).should.eql([]);
        });
    });

    describe('sanitizeStringList', function() {

        it('should convert a list with numbers to a list with string numbers', function() {

            var result1 = fm.sanitizeStringList([11, 22, 33, 44, 55]);
            var result2 = fm.sanitizeStringList(['1', 5, '4']);

            result1.should.have.length(5);
            result1.should.include('11');
            result1.should.include('22');
            result1.should.include('33');
            result1.should.include('44');
            result1.should.include('55');

            result2.should.have.length(3);
            result2.should.include('1');
            result2.should.include('4');
            result2.should.include('5');
        });

        it('should convert a single scalar value to an array with a string element', function() {

            var result1 = fm.sanitizeStringList(12);
            var result2 = fm.sanitizeStringList('okay');

            result1.should.eql(['12']);
            result1[0].should.be.a.String;
            result2.should.eql(['okay']);
            result2[0].should.be.a.String;
        });

        it('should return an empty array if an empty array was passed', function() {

            fm.sanitizeStringList([]).should.eql([]);
        });
    });

    describe('sanitizeFloatList', function() {

        it('should convert a list of both numbers and string numbers to a list containing only floats', function() {

            var result = fm.sanitizeFloatList([2.2, 3.3, '4.444', '5.2']);

            result.should.have.length(4);
            result.should.include(2.2);
            result.should.include(3.3);
            result.should.include(4.444);
            result.should.include(5.2);
        });

        it('should remap a scalar value into an array containing a single float', function() {

            var result1 = fm.sanitizeFloatList(2.345);
            var result2 = fm.sanitizeFloatList('3.234');

            result1.should.have.length(1);
            result1[0].should.be.a.Number;
            result2.should.have.length(1);
            result2[0].should.be.a.Number;
        });

        it('should return an empty array if an empty array was passed', function() {

            fm.sanitizeFloatList([]).should.eql([]);
        });
    });
});

