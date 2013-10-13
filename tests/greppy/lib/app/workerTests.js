/**
 * Tests for lib/app/worker.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve(__dirname + '/../../../../');
var Worker = require(root + '/lib/app/worker');

// currently not working correctly
describe.skip('worker', function() {

    var cwdBak;

    before(function() {

        cwdBak = process.cwd();
        process.chdir('/tmp/greppy/project/');
        greppy = require(root + '/lib/greppy');
    });

    after(function() {

        delete greppy;
        process.chdir(cwdBak);
    });

    it('should throw a meaningful error when initialized without an app object', function() {

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
