/**
 * Tests for lib/extension/datatype/number.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve('./');

describe('extensions for the number type', function() {
    
    before(function() {
        require(root + '/lib/extension/datatype/number');
    });
    
    describe('format', function() {
        
        it('should return a string', function() {
            var num    = 3;
            var result = num.format(4, ',', '.');
            
            result.should.be.a('string');
        });
        
        it('should have the defined amount of decimals', function() {
            var num    = 4.123456789;
            var result = num.format(5, ',', '.');
            
            result.should.match(/^4,\d{5}$/);
        });
        
        it('should have the specified thousands separator', function() {
            var num    = 10000000.1234;
            var result = num.format(4, ',', '&');
            
            result.should.equal('10&000&000,1234');
        });
        
        it('should have the specified decimal separator', function() {
            var num    = 10000000.1234;
            var result = num.format(4, '%', '.');
            
            result.should.equal('10.000.000%1234');
        });
    });
    
    describe('humanize', function() {
        
        it('should return a string', function() {
            var num    = 3;
            var result = num.humanize();
            
            result.should.be.a('string');
        });
        
        it('should round and strip decimals of a number smaller than thousand', function() {
            var num1    = 999.4;
            var num2    = 999.5;
            var result1 = num1.humanize();
            var result2 = num2.humanize();
            
            result1.should.equal('999');
            result2.should.equal('1 000');
        });
        
        it('should shorten the number and add a k-suffix, if the number is greater or equal than thousand but smaller than a million', function() {
            var num1    = 10000;
            var num2    = 100000;
            var result1 = num1.humanize();
            var result2 = num2.humanize();
            
            result1.should.equal('10k');
            result2.should.equal('100k');
        });
        
        it('should shorten the number and add an M-suffix, if the number is greater or equal than a million', function() {
            var num1 = 1000000;
            var num2 = 100000000;
            var result1 = num1.humanize();
            var result2 = num2.humanize();
            
            result1.should.equal('1M');
            result2.should.equal('100M');
        });
    });
    
    describe('memory', function() {
        
        var kilo = 1024;
        var mega = Math.pow(1024, 2);
        var giga = Math.pow(1024, 3);
        var tera = Math.pow(1024, 4);
        var peta = Math.pow(1024, 5);
        var exa  = Math.pow(1024, 6);
        
        it('should return a string', function() {
            var num    = 10;
            var result = num.memory();
            
            result.should.be.a('string');
        });
        
        it('should return the rounded number of bytes with a B-suffix for numbers smaller than 1024', function() {
            var num    = 1023.9;
            var result = num.memory();

            result.should.equal('1023.90 B');
        });

        it('should return the rounded number of kilobytes with a KB-suffix for numbers greater or equal than 1024 but smaller than 1024^2', function() {
            var num1    = kilo;
            var num2    = mega - 1;
            var result1 = num1.memory();
            var result2 = num2.memory();

            result1.should.equal('1.00 KB');
            result2.should.equal((num2 / kilo).toFixed(2) + ' KB');
        });

        it('should return the rounded number of megabytes with a MB-suffix for numbers greater or equal than 1024^2 but smaller than 1024^3', function() {
            var num1    = mega;
            var num2    = giga - 1;
            var result1 = num1.memory();
            var result2 = num2.memory();

            result1.should.equal('1.00 MB');
            result2.should.equal((num2 / mega).toFixed(2) + ' MB');
        });
        
        it('should return the rounded number of gigabytes with a GB-suffix for numbers greater or equal than 1024^3 but smaller than 1024^4', function() {
            var num1    = giga;
            var num2    = tera - 1;
            var result1 = num1.memory();
            var result2 = num2.memory();

            result1.should.equal('1.00 GB');
            result2.should.equal((num2 / giga).toFixed(2) + ' GB');
        });
        
        it('should return the rounded number of terabytes with a TB-suffix for numbers greater or equal than 1024^4 but smaller than 1024^5', function() {
            var num1    = tera;
            var num2    = peta - 10;
            var result1 = num1.memory();
            var result2 = num2.memory();

            result1.should.equal('1.00 TB');
            result2.should.equal((num2 / tera).toFixed(2) + ' TB');
        });
        
        it('should return the rounded number of petabytes with a PB-suffix for numbers greater or equal than 1024^5 but smaller than 1024^6', function() {
            var num1    = peta;
            var num2    = exa - 10000;
            var result1 = num1.memory();
            var result2 = num2.memory();

            result1.should.equal('1.00 PB');
            result2.should.equal((num2 / peta).toFixed(2) + ' PB');
        });
    });
});
