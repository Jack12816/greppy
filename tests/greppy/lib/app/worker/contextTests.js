/**
 * Tests for lib/app/worker/context.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should  = require('should');
var path    = require('path');
var root    = path.resolve(__dirname + '/../../../../../');
var express = require('express');
var Context = require(root + '/lib/app/worker/context');
var ct      = null;

describe('Context', function() {

    it('should have a property name which is based on the provided constructor-parameter', function() {

        var param = 'i/am/some/path/to/a/file.js';

        ct = new Context(param);

        ct.name.should.equal('file');
    });

    it('should have a property description which should be a string', function() {

        ct = new Context();

        ct.description.should.be.a.String;
    });

    it('should have a property backends which should be an empty object', function() {

        ct = new Context();

        ct.backends.should.eql({});
    });

    it('should have a property modules which should be an empty array', function() {

        ct = new Context();

        ct.modules.should.eql([]);
    });

    it('should have a property controllers which should be an empty object', function() {

        ct = new Context();

        ct.controllers.should.eql({});
    });

    it('should have a property routes which should be an empty object', function() {

        ct = new Context();

        ct.modules.should.eql({});
    });

    it('should have a method configure which calls a given callback', function(done) {
        
        ct = new Context();

        ct.configure(null, null, function() {
            done();
        });
    });
});
