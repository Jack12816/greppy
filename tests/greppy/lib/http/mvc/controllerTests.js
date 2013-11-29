/**
 * Tests for lib/http/mvc/controller.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should     = require('should');
var path       = require('path');
var root       = path.resolve(__dirname + '/../../../../../');
var Controller = require(root + '/lib/http/mvc/controller');
var cr         = null;

describe('Controller', function() {

    before(function() {

        // create global greppy mockup
        greppy = {
            helper: {
                list: function() {
                    return [];
                }
            }
        };
    });

    beforeEach(function() {
        cr = new Controller();
    });

    after(function() {

        // delete global greppy mockup
        delete greppy;
    });

    it('should have an options property with the correct structure and values', function() {

        cr.options.should.have.property('path');
        cr.options.should.have.property('auth');
        cr.options.auth.should.have.property('handler');
        cr.options.auth.should.have.property('routes');
        cr.options.path.should.equal('');
        should.equal(cr.options.auth.handler, null);
        should.equal(cr.options.auth.routes, null);
    });

    it('should have an actions namespace', function() {
        cr.actions.should.be.a.Object;
    });

    it('should have an helpers namespace', function() {
        cr.helpers.should.be.a.Object;
    });

    it('should have a viewPath property', function() {
        cr.viewPath.should.be.a.String;
    });

    it('should have a configure method which calls the provided callback', function(done) {

        cr.configure(null, null, function() {
            done();
        });
    });

    it('should have a method view which returns the view-path for a given file', function() {

        cr.view('xyz.jade').should.equal('/xyz.jade');

        cr.viewPath = '/some/path/';

        cr.view('myView.jade').should.equal('/some/path/myView.jade');
    });

    it('should have a link method which returns a valid link for a given action', function() {

        var actionsMockup = {
            testAction: {
                path: '/myTest/'
            },
            other: {
                path: '/okay/'
            },
            okay: {
                path: '/lorem/'
            }
        };

        cr.basePath = '/myBase'
        cr.actions  = actionsMockup;

        cr.should.have.property('link');
        cr.link.should.be.an.instanceOf(Function);

        cr.link('testAction').should.equal('/myBase/myTest/');
        cr.link('other').should.equal('/myBase/okay/');
        cr.link('okay').should.equal('/myBase/lorem/');
    });

    it('should correctly handle the params-argument of it\'s link method', function() {

        var actionsMockup = {
            testAction: {
                path: '/myTest/:myParam'
            },
            someOtherAction: {
                path: '/someOtherAction/:otherParam'
            }
        };

        cr.basePath = '/somePath';
        cr.actions  = actionsMockup;

        cr.link('testAction', {
            myParam: 'yo'
        }).should.equal('/somePath/myTest/yo');

        cr.link('someOtherAction', {
            otherParam: 'replacedVal'
        }).should.equal('/somePath/someOtherAction/replacedVal');
    });
});

