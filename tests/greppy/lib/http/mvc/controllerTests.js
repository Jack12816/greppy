/**
 * Tests for lib/http/mvc/controller.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should     = require('should');
var path       = require('path');
var root       = path.resolve('./');
var Controller = require(root + '/lib/http/mvc/controller');
var controller = null;

describe('controller', function() {
    
    before(function() {
        
        // create global greppy mockup
        greppy = {
            helper: {
                list: function() {
                    return [];
                }
            }
        }
    });
    
    beforeEach(function() {
        controller = new Controller();
    });
    
    after(function() {
        
        // delete global greppy mockup
        delete greppy;
    });
    
    it('should have an options property with the correct structure and values', function() {
        controller.options.should.have.property('path');
        controller.options.should.have.property('auth');
        controller.options.auth.should.have.property('handler');
        controller.options.auth.should.have.property('routes');
        controller.options.path.should.equal('');
        should.equal(controller.options.auth.handler, null);
        should.equal(controller.options.auth.routes, null);
    });
    
    it('should have an actions object', function() {
        controller.actions.should.be.a('object');
    });
    
    it('should have a viewPath property', function() {
        controller.viewPath.should.be.a('string');
    });
    
    it('should have a configure method which calls the provided callback', function(done) {
        controller.configure(null, null, function() {
            done();
        });
    });
    
    it('should have a method view which returns the view-path for a given file', function() {
        controller.view('xyz.jade').should.equal('/xyz.jade');
        
        controller.viewPath = '/some/path/';
        
        controller.view('myView.jade').should.equal('/some/path/myView.jade');
    });
});

