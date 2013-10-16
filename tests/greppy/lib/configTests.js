/**
 * Tests for lib/helper/config.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve(__dirname + '/../../../');
var Config = require(root + '/lib/config');
var cg     = null;

describe('config', function() {
    
    describe('load', function() {
        
        it('should throw an error if no path was provided', function() {
            cg = new Config({});
            
            (function() {
                cg.load();
            }).should.throwError(/path/);
        });
        
    });
    
    
});
