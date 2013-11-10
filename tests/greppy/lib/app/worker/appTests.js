/**
 * Tests for lib/app/worker/app.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should  = require('should');
var path    = require('path');
var request = require('supertest');
var colors  = require('colors');
var root    = path.resolve(__dirname + '/../../../../../');
var express = require('express');
var App     = require(root + '/lib/app/worker/app');

describe('App', function() {

    var exApp = null;
    var app   = null;

    beforeEach(function () {
        exApp = express();

        // setting global needed by some tests
        logger  = {
            debug: function(s) {
            }
        };

        // mockup of greppy global
        greppy = {
            config: {
                get: function() {
                    return {
                        get: function() {
                            return null;
                        }
                    }
                }
            }
        };
    });

    function getFuncName(fun) {
        return /\W*function\s+([\w\$]+)\(/.exec(fun.toString())[1];
    }

    it('should let the app use the body parser when it\'s configure method is called', function() {

        var workerMockup = {
            context: {
                routes: []
            }
        };
        var hasJSON       = false;
        var hasUrlencoded = false;

        app = new App(workerMockup);

        app.configure(exApp, null, null);

        hasJSON = exApp.stack.some(function(mw) {
            if ('json' === getFuncName(mw.handle)) {
                return true;
            }
        });

        hasUrlencoded = exApp.stack.some(function(mw) {
            if ('urlencoded' === getFuncName(mw.handle)) {
                return true;
            }
        });

        hasJSON.should.be.true;
        hasUrlencoded.should.be.true;
    });

    it('should only allow digits for id-parameters', function(done) {

        var workerMockup = {
            context: {
                routes: [
                    {
                        path: '/just/some/test/',
                        method: 'get'
                    }
                ]
            }
        };

        app = new App(workerMockup);

        app.configure(exApp, null, null);

        exApp.get('/just/some/test/:id', function(req, res) {
            res.send(req.params.id);
        });

        request(exApp)
            .get('/just/some/test/456')
            .end(function(err, res) {
                should.not.exist(err);
                res.text.should.equal('456');

                request(exApp)
                    .get('/just/some/test/def')
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.statusCode.should.equal(404);
                        res.text.toLowerCase().should.include('cannot');
                        done();
                });
        });
    });

    it('should only allow valid uuids for uuid-parameters', function(done) {

        var workerMockup = {
            context: {
                routes: [
                    {
                        path: '/another/test',
                        method: 'get'
                    }
                ]
            }
        };

        app = new App(workerMockup);

        app.configure(exApp, null, null);

        exApp.get('/another/test/:uuid', function(req, res) {
            res.send(req.params.uuid);
        });

        request(exApp)
            .get('/another/test/550e8400-e29b-11d4-a716-446655440000')
            .end(function(err, res) {
                should.not.exist(err);
                res.text.should.equal('550e8400-e29b-11d4-a716-446655440000');

                request(exApp)
                    .get('/another/test/5508400-e29b-11d4-a716-446655440000')
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.statusCode.should.equal(404);
                        res.text.toLowerCase().should.include('cannot');
                        done();
                });
        });
    });

    it('should only allow valid oids for oid-parameters', function(done) {

        var workerMockup = {
            context: {
                routes: [
                    {
                        path: '/ok/then',
                        method: 'get'
                    }
                ]
            }
        };

        app = new App(workerMockup);

        app.configure(exApp, null, null);

        exApp.get('/ok/then/:oid', function(req, res) {
            res.send(req.params.oid);
        });

        request(exApp)
            .get('/ok/then/fa54c3f7fcaa453dcd45f449')
            .end(function(err, res) {
                should.not.exist(err);
                res.statusCode.should.equal(200);
                res.text.should.equal('fa54c3f7fcaa453dcd45f449');

                request(exApp)
                    .get('/ok/then/fdsfsdfewgrt54')
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.statusCode.should.equal(404);
                        res.text.toLowerCase().should.include('cannot');
                        done();
                });
        });
    });


});

