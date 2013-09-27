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
 * @param {Object} options - Options object
 * @return void
 */
var Worker = function(options)
{
    // Annotate this
    greppy.worker = this;
    greppy.db     = new (greppy.get('store.db'))(
        greppy.config.get('app').get('database')
    );

    // Default properties
    this.controllerLoader = new ControllerLoader(this);
    this.options          = options || {};
    this.modules          = {};

    // Setup process title
    process.title = this.options.title || 'greppy-worker';

    // Setup cli configuration
    var defaultCliConf = {
        args: [
            ['h', 'help', 'Display this help'],
            ['c', 'context=CONCRETE_WORKER', 'Start the concrete worker implementation'],
            ['d', 'debug', 'Start the worker in debug mode']
        ],
        help: [
            "This is a Greppy framework cluster worker implementation.\n\n"
            + "[[OPTIONS]]\n"
        ].join()
    };

    // Parse given arguments and prepare them for the master process
    var cliConf = extend(true, defaultCliConf, this.options.cli || {});
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

    // Annotate the worker context
    greppy.context = this.cliArgs.options.context;

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

    var loggerConf = extend(true, defaultLoggerConf, this.options.logger || {});
    this.logger    = new winston.Logger(loggerConf);
    greppy.logger  = global.logger = this.logger;
};

/**
 * Setup the worker.
 *
 * @param {Object} app - Express application object
 * @param {Object} server - HTTP(S) server object
 * @param {Function} callback - Function to call on finish
 * @return void
 */
Worker.prototype.configure = function(app, server, callback)
{
    if (!app) {
        throw new Error('No application object was given');
        return;
    }

    if (!server) {
        throw new Error('No server instance was given');
        return;
    }

    var self    = this;
    this.app    = app;
    this.server = server;

    var setupModules = function()
    {
        var listenServer = function() {

            // Load all routes into the application
            self.controllerLoader.configure(self.app);

            // Push view helpers to the application
            self.app.locals.helper = {};

            greppy.helper.list().forEach(function(helper) {

                if (-1 === helper.indexOf('view')) {
                    return;
                }

                path = helper.split('.');
                path.splice(path.indexOf('view'), 1);

                var buildPath = function(base, props, value) {

                    var prop = props.shift();

                    if (!prop) {
                        return;
                    }

                    if (0 === props.length) {
                        base[prop] = value;
                        return;
                    }

                    if (!base.hasOwnProperty(prop)) {
                        base[prop] = {};
                    }

                    buildPath(base[prop], props, value);
                }

                buildPath(self.app.locals.helper, path, greppy.helper.get(helper));
            });

            // Bind listening event to http server
            self.server.on('listening', function() {

                var address = self.server.address();

                logger.info(
                    'HTTP server is listening on '
                    + address.address + ':' + new String(address.port).green.bold + ' ('
                    + address.family + ')'
                );

                callback && callback();
            });
        };

        // Setup default controller configuration
        var defaultControllersConf = {
            ipc: {
                path: __dirname + '/cluster/worker/ipc/controller.js',
                module: 'greppy',
                enabled: true
            },
            icc: {
                path: __dirname + '/cluster/worker/icc/controller.js',
                module: 'greppy',
                enabled: false
            }
        }

        var setupApplication = function()
        {
            // First step - merge generic worker config
            var controllersConf = extend(true, defaultControllersConf, self.options.controllers || {});

            // Second step - merge worker context config
            controllersConf = extend(true, controllersConf, self.context.controllers);

            self.loadControllers(controllersConf);

            // Setup the modules to load
            var modules = self.options.modules || [];

            if (self.context.modules) {
                modules = Array.uniq(modules.concat(self.context.modules));
            }

            if (0 !== modules.length) {
                self.loadModules(modules);
            }

            // Configure the app with Greppy enhancements
            var defaultApp = new (require('./worker/app'))(self.context);

            defaultApp.configure(self.app, self.server, listenServer);
        }

        // Run the configure method of the context
        if (self.context.configure) {
            self.context.configure(self.app, self.server, setupApplication);
            return;
        }

        setupApplication();
    }

    // Setup the worker context
    try {

        this.context = new (require(process.cwd() + '/app/context/' + this.cliArgs.options.context))();
        logger.info('Using the ' + this.context.name.red.bold + ' worker context');

        greppy.db.configure(this.context.backends, function(err) {

            // We got an error while configuring the database-backends
            // so we should die and allow the master to bootstrap another
            // worker to try it again
            if (err) {
                logger.error('An error occurred while configuring the backend.');
                logger.warn(
                    'It is safer to shutdown the worker '
                    + 'to give the master the opportunity to reboot this worker - which '
                    + 'could be successful. Shutting down..'
                );
                process.exit(111);
                return;
            }

            setupModules();
        });

    } catch (e) {

        console.log(
            'Error occured while loading the '.red
            + this.cliArgs.options.context.red.bold
            + ' context.'.red + '\n'
        );

        if (e.stack) {
            console.log(e.stack);
        } else {
            console.log(e);
        }

        process.exit(1);
    }
}

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

        self.controllerLoader.loadController(conf.path, key, conf.module);
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

