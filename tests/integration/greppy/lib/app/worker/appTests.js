/**
 * Tests for lib/app/worker/app.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var async   = require('async');
var should  = require('should');
var path    = require('path');
var request = require('supertest');
var colors  = require('colors');
var root    = path.resolve(__dirname + '/../../../../../../');
var express = require('express');
var App     = require(root + '/lib/app/worker/app');

describe('Default App Configurator', function() {

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

    it('should let the client app use the body parser when it\'s configure method is called', function(done) {

        var workerMockup = {
            context: {
                routes: []
            }
        };
        var hasJSON       = false;
        var hasUrlencoded = false;

        app = new App(workerMockup);

        app.preConfigure(exApp, null, function() {
            app.configure(exApp, null, function() {

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

                done();
            });
        });
    });

    it('should only allow digits (primary keys) for id-parameters', function(done) {

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

        app.preConfigure(exApp, null, function() {
            app.configure(exApp, null, function() {

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
        });
    });

    it('should only allow valid uuids (version 1 to 5) for uuid-parameters', function(done) {

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

        app.preConfigure(exApp, null, function() {
            app.configure(exApp, null, function() {

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
        });
    });

    it('should only allow valid MongoDB object ids for oid-parameters', function(done) {

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

        app.preConfigure(exApp, null, function() {
            app.configure(exApp, null, function() {

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
    });

    it('should only allow valid semver version numbers for version-parameters', function(done) {

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

        app.preConfigure(exApp, null, function() {
            app.configure(exApp, null, function() {

                async.waterfall([

                    function(callback) {

                        exApp.get('/ok/then/:version', function(req, res) {
                            res.send(req.params.version[0]);
                        });

                        callback && callback();
                    },

                    function(callback) {

                        request(exApp).get('/ok/then/v1.0.0')
                                      .end(function(err, res) {

                            should.not.exist(err);
                            res.statusCode.should.equal(200);
                            res.text.should.equal('v1.0.0');

                            callback && callback();
                        });
                    },

                    function(callback) {

                        request(exApp).get('/ok/then/1.0.0')
                                      .end(function(err, res) {

                            should.not.exist(err);
                            res.statusCode.should.equal(200);
                            res.text.should.equal('1.0.0');

                            callback && callback();
                        });
                    },

                    function(callback) {

                        request(exApp).get('/ok/then/1.0.0-5')
                                      .end(function(err, res) {

                            should.not.exist(err);
                            res.statusCode.should.equal(200);
                            res.text.should.equal('1.0.0-5');

                            callback && callback();
                        });
                    },

                    function(callback) {

                        request(exApp).get('/ok/then/v1.0.0-5+build7')
                                      .end(function(err, res) {

                            should.not.exist(err);
                            res.statusCode.should.equal(200);
                            res.text.should.equal('v1.0.0-5+build7');

                            callback && callback();
                        });
                    },

                    function(callback) {

                        request(exApp).get('/ok/then/.0.0-5')
                                      .end(function(err, res) {

                            should.not.exist(err);
                            res.statusCode.should.equal(404);
                            res.text.toLowerCase().should.include('cannot');

                            callback && callback();
                        });
                    }

                ], done);
            });
        });
    });
});

