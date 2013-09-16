/**
 * Tests for lib/app/worker.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve('./');
var Worker = require(root + '/lib/app/worker');

describe('worker', function() {
    
    it('should throw a meaningful error when initialized without a app object', function() {
    
        (function() {
            var worker = new Worker(null, {}, {}, function() {});
        }).should.throwError(/.*application.*/i);
    });
    
    it('should throw a meaningful error when initialized without a server instance', function() {
    
        (function() {
            var worker = new Worker({}, null, {}, function() {});
        }).should.throwError(/.*server.*/i);
    });
});
