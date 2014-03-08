/**
 * Tests for lib/extension/datatype/string.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve(__dirname + '/../../../../../');

describe('Extensions for String', function() {

    before(function() {
        require(root + '/lib/extension/datatype/string');
    });

    describe('toCamelCase', function() {

        it('should convert a hypen separated string to camelCase', function() {

            var myStr1  = 'i-am-some-cool-string';
            var myStr2  = 'lets--see--how----you---handle-----me';
            var myStr3  = '-another-cool--string-';

            var result1 = myStr1.toCamelCase();
            var result2 = myStr2.toCamelCase();
            var result3 = myStr3.toCamelCase();

            result1.should.equal('iAmSomeCoolString');
            result2.should.equal('letsSeeHowYouHandleMe');
            result3.should.equal('anotherCoolString');
        });
    });

    describe('words', function() {

        it('should truncate a string to the given amount of words and add a space with dots if it was longer than it is after processing', function() {

            var myStr1  = 'this is a sentence to test the implementation of our nice function';
            var myStr2  = 'this sentence is just for testing, too.';
            var result1 = myStr1.words(3);
            var result2 = myStr2.words(6);

            result1.should.equal('this is a ..');
            result2.should.equal('this sentence is just for testing, ..');
        });

        it('should not modify the string if the given amount of words is equal or greater than the actual amount of words', function() {

            var myStr1  = 'good job.';
            var myStr2  = 'this sentence has just six words';
            var result1 = myStr1.words(2);
            var result2 = myStr2.words(7);

            result1.should.equal('good job.');
            result2.should.equal('this sentence has just six words');
        });

        it('should return up to ten words if no amount of words was given.', function() {

            var myStr  = 'test me, because i like to be tested and so we both profit from this.';
            var result = myStr.words(0);

            result.should.equal('test me, because i like to be tested and so ..');
        });
    });

    describe('remove', function() {

        it('should return a version of the calling string which has the passed strings and/or regexps removed', function() {

            var myStr1  = 'blueberries';
            var myStr2  = 'Ubuntu';
            var myStr3  = 'u{4}k?';
            var myStr4  = 'UbuntuUser';

            var result1 = myStr1.remove('b', 'e', 'r');
            var result2 = myStr2.remove('u');
            var result3 = myStr3.remove('u{4}k');
            var result4 = myStr4.remove(/u/gi, 'er', /b/);

            result1.should.equal('luis');
            result2.should.equal('Ubnt');
            result3.should.equal('?');
            result4.should.equal('nts');
        });
    });
});

