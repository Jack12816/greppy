/**
 * ACME Worker Context
 *
 * @module acme-app/app/worker/context/acme
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util    = require('util');
var express = require('express');

/**
 * @constructor
 */
var ACMEContext = function()
{
    // Call the super constructor
    ACMEContext.super_.call(this, __filename);

    // Worker context description.
    this.description = 'Website of ACME';

    // Worker context backends configuration.
    // Setting this value to null no database
    // connection will be established. Setting
    // this value to an empty object will load
    // all connections of all backends. You can
    // add an "mysql" property with an array with
    // the names of your connections, so we will
    // only load them. An empty array for an property
    // will load all connections of the given backend.
    this.backends = {};

    // Worker context modules configuration.
    this.modules = ['acme'];

    // Worker context controllers configuration.
    this.controllers = {
        ipc: {
            enabled: false
        }
    };
};

/**
 * Extend the Greppy framework worker context
 */
util.inherits(ACMEContext, greppy.get('app.worker.context'));

/**
 * Worker context configure method.
 */
ACMEContext.prototype.configure = function(app, server, callback)
{
    // Templating Engine
    app.set('views', process.cwd() + '/modules/acme/resources/views/');
    app.set('view engine', 'jade');
    app.locals.pretty = true;

    // Common Middleware
    app.use(express.compress());
    app.use(express.static(process.cwd() + '/public'));

    // Start listening for connections
    server.listen(3000);

    callback && callback();
};

module.exports = ACMEContext;

