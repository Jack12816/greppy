/**
 * Single-Threading Application Worker
 *
 * @module greppy/app/worker
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var cluster          = require('cluster');
var winston          = require('winston');
var expressWinston   = require('express-winston');
var moment           = require('moment');
var colors           = require('colors');
var extend           = require('extend');
var getopt           = require('node-getopt');
var async            = require('async');
var ControllerLoader = require('../http/mvc/loader');

/**
 * @constructor
 *
 * @param {Object} options - Options object
 */
var Worker = function(options)
{
    // Mark bootup time end
    this.bootStart = new Date();

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

    // Configure CLI arguments
    this.configureCliArguments();

    // Annotate the worker context
    greppy.context = this.cliArgs.options.context;

    // Configure the logger
    this.configureLogger();

    greppy.logger = global.logger = this.logger;

    // Configure context
    this.configureContext();
};

/**
 * Get the winston logger instance.
 *
 * @return {Object}
 */
Worker.prototype.getLogger = function()
{
    return this.logger;
};

/**
 * Get the worker commandline interface arguments.
 *
 * @return {Object}
 */
Worker.prototype.getCliArgs = function()
{
    return this.cliArgs;
};

/**
 * Get the concrete worker implementation.
 *
 * @return {Object}
 */
Worker.prototype.getContext = function()
{
    return this.context;
};

/**
 * Parse CLI arguments.
 */
Worker.prototype.configureCliArguments = function()
{
    // Setup cli configuration
    var defaultCliConf = {
        args: [
            ['h', 'help', 'Display this help'],
            ['c', 'context=CONCRETE_WORKER', 'Start the concrete worker implementation'],
            ['d', 'debug', 'Start the worker in debug mode']
        ],
        help: [
            "This is a Greppy framework cluster worker implementation.\n\n" +
            "[[OPTIONS]]\n"
        ].join()
    };

    // Parse given arguments and prepare them for the master process
    var cliConf = extend(true, defaultCliConf, this.options.cli || {});
    this.cli = getopt.create(cliConf.args);
    this.cli.setHelp(cliConf.help);
    this.cliArgs = this.cli.parseSystem();

    if (0 === Object.keys(this.cliArgs.options).length ||
        this.cliArgs.options.hasOwnProperty('help')) {
        this.cli.showHelp();
        process.exit(0);
    }

    // The worker needs the concrete worker switch, so we check it
    if (!this.cliArgs.options.hasOwnProperty('context')) {
        console.log(
            'The '.red + '--context='.red.bold + ' switch was not given. ' +
            'You need a concrete worker implementation.'.red + '\n'
        );
        process.exit(1);
    }
};

/**
 * Setup logger instance.
 */
Worker.prototype.configureLogger = function()
{
    // Setup winston logger
    var defaultLoggerConf = {
        colors : {
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
                level  : 'debug',
                silent : false
            })
        ]
    };

    var loggerConf = extend(
        true, {}, defaultLoggerConf,
        this.options.logger || {}
    );

    this.logger = new winston.Logger(loggerConf);

    // Setup winston request logger
    var defaultRequestLoggerConf = {
        transports: [
            new (winston.transports.File)({
                json: false,
                filename: '%s/var/log/%s.access.log'.format(
                    process.cwd(), greppy.context
                )
            })
        ]
    };

    var requestLoggerConf = extend(
        false, {}, defaultRequestLoggerConf,
        this.options.requestLogger || {}
    );

    this.requestLogger = expressWinston.logger(requestLoggerConf);
};

/**
 * Setup context.
 */
Worker.prototype.configureContext = function()
{
    // Setup the worker context
    this.context = new (require('%s/app/context/%s'.format(
        process.cwd(), this.cliArgs.options.context
    )))();

    logger.info('Using the %s worker context', this.context.name.red.bold);

    // Configure the app with Greppy enhancements
    this.baseApp = new (require('./worker/app'))(this);
};

/**
 * Load given controllers.
 *
 * @param {Object} controllers - Configuration of controllers to load
 * @param {Function} callback - Function to call on finish
 */
Worker.prototype.loadControllers = function(controllers, callback)
{
    var self = this;
    logger.info('Loading enabled' + ' %s '.red + 'controllers', 'default');

    async.each(Object.keys(controllers), function(name, callback) {

        // Setup the named alias
        var controller = controllers[name];

        // Skip disabled controllers
        if (!controller.enabled) {
            return callback();
        }

        // Load the controller
        self.controllerLoader.loadController(
            controller.path, name, controller.module, callback
        );

    }, callback);
};

/**
 * Load given modules.
 *
 * @param {Array} modules - Modules to load
 * @param {Function} callback - Function to call on finish
 */
Worker.prototype.loadModules = function(modules, callback)
{
    this.controllerLoader.load(modules, callback);
};

/**
 * Setup database connections.
 *
 * @param {Function} callback - Function to call on finish
 */
Worker.prototype.configureDatabases = function(callback)
{
    greppy.db.configure(this.context.backends, function(err) {

        // We got an error while configuring the database-backends
        // so we should die and allow the master to bootstrap another
        // worker to try it again
        if (err) {

            logger.error('An error occurred while configuring the backend.');
            logger.warn(
                'It is safer to shutdown the worker ' +
                'to give the master the opportunity to reboot this worker - which ' +
                'could be successful. Shutting down..'
            );
        }

        callback && callback(err);
    });
};

/**
 * Setup Greppy default controllers.
 *
 * @param {Function} callback - Function to call on finish
 */
Worker.prototype.configureDefaultControllers = function(callback)
{
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
    };

    // First step - merge generic worker config
    var controllersConf = extend(
        true, defaultControllersConf, this.options.controllers || {}
    );

    // Second step - merge worker context config
    controllersConf = extend(
        true, controllersConf, this.context.controllers
    );

    this.loadControllers(controllersConf, callback);
};

/**
 * Setup context modules.
 *
 * @param {Function} callback - Function to call on finish
 */
Worker.prototype.configureContextModules = function(callback)
{
    // Setup the modules to load
    var modules = this.options.modules || [];

    if (this.context.modules) {
        modules = Array.uniq(modules.concat(this.context.modules));
    }

    if (0 === modules.length) {
        return callback && callback();
    }

    this.loadModules(modules, function(err) {
        callback(err);
    });
};

/**
 * Setup the application stack.
 *
 * @param {Object} app - The application object
 * @param {Object} server - Server object
 * @param {Function} callback - Function to call on finish
 */
Worker.prototype.configureApplicationStack = function(app, server, callback)
{
    // Push the request logger to the middleware stack
    app.use(this.requestLogger);

    // Bind listening event to http server
    server.on('listening', function() {
        var address = self.server.address();
        logger.info(
            'HTTP server is listening on %s:%s (%s)',
            address.address,
            ('' + address.port).green.bold,
            address.family
        );
    });

    var self = this;

    async.waterfall([

        function(callback) {
            self.baseApp.preConfigure(
                app, server, callback
            );
        },

        function(callback) {
            self.context.preConfigure(
                app, server, callback
            );
        },

        function(callback) {
            self.baseApp.configure(
                app, server, callback
            );
        },

        function(callback) {
            self.context.configure(
                app, server, callback
            );
        },

        function(callback) {
            self.baseApp.postConfigure(
                app, server, callback
            );
        },

        function(callback) {
            self.context.postConfigure(
                app, server, callback
            );
        },

        // Load configured context modules
        function(callback) {
            self.configureContextModules(callback);
        }

    ], function(err) {
        callback && callback(err);
    });
};

/**
 * Setup the worker.
 *
 * @param {Object} app - Express application object
 * @param {Object} server - HTTP(S) server object
 * @param {Function} callback - Function to call on finish
 */
Worker.prototype.configure = function(app, server, callback)
{
    if (!app) {
        throw new Error('No application object was given');
    }

    if (!server) {
        throw new Error('No server instance was given');
    }

    // Setup aliases
    var self    = this;
    this.app    = app;
    this.server = server;

    var onError = function(err)
    {
        if (!err) {
            return;
        }

        console.log(
            'Error occured while loading the '.red +
            self.cliArgs.options.context.red.bold +
            ' context.'.red + '\n'
        );

        if (err.stack) {
            console.log(err.stack);
        } else {
            console.log(err);
        }

        process.exit(1);
    };

    // Run the setup
    try {

        async.parallel([

            // Setup Greppy default controllers
            function(callback) {
                self.configureDefaultControllers(callback);
            },

            // Configure database connections
            function(callback) {
                self.configureDatabases(function(err) {

                    if (err) {
                        process.exit(111);
                        return;
                    }

                    self.configureApplicationStack(
                        app, server, callback
                    );
                });
            }

        ], function(err) {

            // Check for errors
            onError(err);

            // Rebuild linking cache
            self.baseApp.rebuildLinkingCache();

            // Load all routes into the application
            self.controllerLoader.configure(app);

            // Mark bootup time end
            self.bootEnd = new Date();
            self.bootDuration = self.bootEnd.getTime() - self.bootStart.getTime();

            logger.info(
                'Core boot took %s ms',
                ('' + self.bootDuration).red
            );

            callback && callback();
        });

    } catch (e) {
        onError(e);
    }
};

module.exports = Worker;

