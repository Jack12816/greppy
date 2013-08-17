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
var getopt  = require('node-getopt');

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

    // Annotate this
    var self      = this;
    greppy.worker = this;

    // Default properties
    this.controllerLoader = new ControllerLoader(this);
    this.app              = app;
    this.server           = server;
    this.modules          = {};

    // Setup process title
    process.title = options.title || 'greppy-worker';

    // Setup cli configuration
    var defaultCliConf = {
        args: [
            ['h', 'help', 'Display this help'],
            ['c', 'context=CONCRETE_WORKER', 'Start the concrete worker implementation']
        ],
        help: [
            "This is a Greppy framework cluster worker implementation.\n\n"
            + "[[OPTIONS]]\n"
        ].join()
    };

    // Parse given arguments and prepare them for the master process
    var cliConf = extend(true, defaultCliConf, options.cli || {});
    this.cli = getopt.create(cliConf.args);
    this.cli.setHelp(cliConf.help);
    this.cliArgs = this.cli.parseSystem();

    if (0 === Object.keys(this.cliArgs.options).length || this.cliArgs.options.hasOwnProperty('help')) {
        this.cli.showHelp();
        process.exit(0);
    }

    // The worker needs the concrete worker switch, so we check it
    if (!this.cliArgs.options.hasOwnProperty('context')) {
        console.log(
            'The '.red + '--context='.red.bold + ' switch was not given. '
            + 'You need a concrete worker implementation.'.red + '\n'
        );
        process.exit(1);
    }

    // Setup winston logger
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

    var loggerConf = extend(true, defaultLoggerConf, options.logger || {});
    this.logger    = new winston.Logger(loggerConf);
    greppy.logger  = global.logger = this.logger;

    // Setup the worker context
    try {

        this.context = new (require(process.cwd() + '/app/context/' + this.cliArgs.options.context))();
        logger.info('Using the ' + this.context.name.red.bold + ' worker context');

    } catch (e) {
        console.log(
            'Error occured while loading the '.red + this.cliArgs.options.context.red.bold + ' context.'.red + '\n'
        );
        console.log(e);
        process.exit(1);
    }

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

    // First step - merge generic worker config
    var controllersConf = extend(true, defaultControllersConf, options.controllers || {});

    // Second step - merge worker context config
    controllersConf = extend(true, controllersConf, this.context.controllers);

    this.loadControllers(controllersConf);

    // Setup the modules to load
    var modules = options.modules || [];

    if (this.context.modules) {
        modules = modules.concat(this.context.modules).uniq();
    }

    if (0 !== modules.length) {
        this.loadModules(modules);
    }

    var listenServer = function() {

        // Bind listening event to http server
        self.server.on('listening', function() {

            var address = self.server.address();

            logger.info(
                'HTTP server is listening on '
                + address.address + ':' + new String(address.port).green.bold + ' ('
                + address.family + ')'
            );
        });
    };

    // Run the configure method of the context
    if (this.context.configure) {
        this.context.configure(this.app, this.server, listenServer);
        return;
    }

    listenServer();
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

/**
 * Get the worker commandline interface arguments.
 *
 * @return {Object}
 */
Worker.prototype.getCliArgs = function()
{
    return this.cliArgs;
}

/**
 * Get the concrete worker implementation.
 *
 * @return {Object}
 */
Worker.prototype.getContext = function()
{
    return this.context;
}

module.exports = Worker;

