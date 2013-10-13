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


describe('context', function() {
    
    var context = null;
    
    it('should have a property name which is based on the provided constructor-parameter', function() {
        var param = 'i/am/some/path/to/a/file.js';
        
        context = new Context(param);
        
        context.name.should.equal('file');
    });
    
    it('should have a property description which should be a string', function() {
        context = new Context();
        
        context.description.should.be.a('string');
    });
    
    it('should have a property backends which should be an empty object', function() {
        context = new Context();
        
        context.backends.should.eql({});
    });
    
    it('should have a property modules which should be an empty array', function() {
        context = new Context();
        
        context.modules.should.eql([]);
    });
    
    it('should have a property controllers which should be an empty object', function() {
        context = new Context();
        
        context.controllers.should.eql({});
    });
    
    it('should have a property routes which should be an empty object', function() {
        context = new Context();
        
        context.modules.should.eql({});
    });
    
    it('should have a method configure which calls a given callback', function(done) {
        context = new Context();
        
        context.configure(null, null, function() {
            done();
        });
    });
});
