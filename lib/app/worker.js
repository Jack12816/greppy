/**
 * Single-Threading Application Worker
 *
 * @module greppy/app/worker
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var cluster = require('cluster');
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

    var self      = this;
    global.worker = this;

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

                    var part = moment().format().yellow.bold;

                    if (cluster.isMaster) {
                        part += ' [Master]'.red.bold;
                    } else {
                        part += ' [Worker]'.white.bold;
                    }

                    return part;
                },
                "level"  : 'debug',
                "silent" : false
            })
        ]
    };

    // Setup winston logger
    var loggerConf = extend(true, defaultLoggerConf, options.logger || {});
    this.logger    = new winston.Logger(loggerConf);
    global.logger  = this.logger;

    // Setup default controller configuration
    var defaultControllersConf = {
        ipc: {
            path: __dirname + '/cluster/worker/ipc/controller',
            module: 'greppy',
            enabled: true
        },
        icc: {
            path: __dirname + '/cluster/worker/icc/controller',
            module: 'greppy',
            enabled: false
        }
    }

    var controllersConf = extend(true, defaultControllersConf, options.controllers || {});
    this.loadControllers(controllersConf);

    // Setup given modules
    if (options.modules) {
        this.loadModules(options.modules);
    }

    // Bind listening event to http server
    this.server.on('listening', function() {

        var address = self.server.address();

        logger.info(
            'HTTP server is listening on '
            + address.address + ':' + new String(address.port).green.bold + ' ('
            + address.family + ')'
        );
    });
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
 * Load given controllers.
 *
 * @param {Object} controllersConf - Configuration of controllers to load
 * @return void
 */
Worker.prototype.loadControllers = function(controllersConf)
{
    var self = this;

    logger.info('Loading ' + '%s'.blue + '', 'default controllers');

    Object.keys(controllersConf).forEach(function(key) {

        var conf = controllersConf[key];

        if (!conf.enabled) {
            return;
        }

        self.controllerLoader.loadController(conf.path, key, conf.module, self.app);
    });
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

