/**
 * Single-Threading Application Worker
 *
 * @module greppy/app/worker
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var winston = require('winston');
var moment  = require('moment');
var colors  = require('colors');
var extend  = require('extend');

var ControllerLoader = require('../http/mvc/loader');

/**
 * @constructor
 *
 * @param {Object} app - Express application object
 * @param {Object} server - HTTP(S) server object
 * @param {Object} options - Options object
 */
var Worker = function(app, server, options)
{
    if (!app) {
        throw new Error('No application object was given');
        return;
    }

    if (!server) {
        throw new Error('No server instance was given');
        return;
    }

    // Default properties
    this.controllerLoader = new ControllerLoader();
    this.app              = app;
    this.server           = server;
    this.modules          = {};

    // Setup process title
    process.title = options.title || 'greppy-worker';

    var defaultLoggerConf = {
        colors: {
            debug : 'blue',
            info  : 'grey',
            warn  : 'yellow',
            error : 'red'
        },
        transports: [
            new (winston.transports.Console)({
                colorize  : true,
                timestamp : function() {
                    return moment().format().yellow.bold;
                },
                "level"   : 'debug',
                "silent"  : false
            })
        ]
    };

    // Setup winston logger
    var loggerConf = extend(true, defaultLoggerConf, options.logger || {});
    this.logger    = new winston.Logger(loggerConf);
    global.logger  = this.logger;

    // Setup given modules
    if (options.modules) {
        this.loadModules(options.modules);
    }
};

/**
 * Load given modules.
 *
 * @param {Array} modules - Modules to load
 * @return void
 */
Worker.prototype.loadModules = function(modules)
{
    this.controllerLoader.load(modules, this.app);
}

/**
 * Get the winston logger instance.
 *
 * @return {Object}
 */
Worker.prototype.getLogger = function()
{
    return this.logger;
}

module.exports = Worker;

