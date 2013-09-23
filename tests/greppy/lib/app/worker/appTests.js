/**
 * Tests for lib/app/worker/app.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should  = require('should');
var path    = require('path');
var request = require('supertest');
var root    = path.resolve('./');
var express = require('express');
var App     = require(root + '/lib/app/worker/app');

describe('app', function() {
    
    var exApp = null;
    var app   = null;
    
    beforeEach(function () {
        exApp = express();
    });
    
    function getFuncName(fun) {
        return /\W*function\s+([\w\$]+)\(/.exec(fun.toString())[1];
    }
    
    it('should let the app use the body parser when it\'s configure method is called', function() {
        
        var hasBodyParser = false;
        
        app = new App();
        
        app.configure(exApp, null, null);
        
        hasBodyParser = exApp.stack.some(function(mw) {
            if ('bodyParser' === getFuncName(mw.handle)) {
                return true;
            }
        });
        
        hasBodyParser.should.be.true;
    });
    
    it('should only allow digits for id-parameters', function(done) {
        
        /*var contextMockup = {
            routes: [
                {
                    path: '/just/some/test/',
                    method: 'get'
                }
            ]
        };*/
        
        app = new App();
        
        app.configure(exApp, null, null);
        
        // assume the last element in the stack is the greppy middleware.
        // remove it, so our test will run.
        exApp.stack.pop();
        
        exApp.get('/just/some/test/:id', function(req, res) {
            res.send(req.params.id);
        });
        
        request(exApp)
            .get('/just/some/test/456')
            .end(function(err, res) {
                should.not.exist(err);
                res.text.should.equal('456');
                
                request(exApp)
                    .get('just/some/test/def')
                    .end(function(err, res) {
                        should.exist(err);
                        should.not.exist(res);
                        done();
                });
        });
    });
    
    
});

