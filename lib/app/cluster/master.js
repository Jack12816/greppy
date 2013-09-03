/**
 * Multi-Threading High Availability Application Master
 *
 * @module greppy/app/cluster/master
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var cluster   = require('cluster');
var winston   = require('winston');
var moment    = require('moment');
var colors    = require('colors');
var extend    = require('extend');
var getopt    = require('node-getopt');
var MasterIPC = require('./master/ipc');

/**
 * @constructor
 */
var Master = function(options)
{
    // Annotate this
    var self      = this;
    greppy.master = this;

    // Setup process title
    process.title = options.title || 'greppy-master';

    // Setup cli configuration
    var defaultCliConf = {
        strict: true,
        args: [
            ['h', 'help', 'Display this help'],
            ['v', 'version', 'Show version'],
            ['c', 'context=CONCRETE_WORKER', 'Start the cluster with a concrete worker implementation'],
            ['d', 'debug', 'Start the cluster in debug mode']
        ],
        help: [
            "This is a Greppy framework cluster master implementation.\n\n"
            + "[[OPTIONS]]\n"
        ].join()
    };

    // Parse given arguments and prepare them for the master process
    var cliConf = extend(true, defaultCliConf, options.cli || {});
    this.cli = getopt.create(cliConf.args);
    this.cli.setHelp(cliConf.help);
    this.cliArgs = this.cli.parseSystem();

    // Check for strict mode and if args where given
    if ((cliConf.strict && 0 === Object.keys(this.cliArgs.options).length)
        || this.cliArgs.options.hasOwnProperty('help')
    ) {
        this.cli.showHelp();
        process.exit(0);
    }

    // Print the application version
    if (this.cliArgs.options.hasOwnProperty('version')) {
        var package = require(process.cwd() + '/package');
        console.log(
            'Project '.white + package.name.green.bold
            + ' version: '.white + new String(package.version).green.bold
        );
        process.exit(0);
    }

    // The master needs the concrete worker switch, so we check it
    if (!this.cliArgs.options.hasOwnProperty('context')) {
        console.log(
            'The '.red + '--context='.red.bold + ' switch was not given. '
            + 'You need a concrete worker implementation.'.red + '\n'
        );
        process.exit(1);
    }

    this.contextName = this.cliArgs.options.context;

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
                    return moment().format().yellow.bold
                            + ' [Master]'.red.bold;
                },
                "level"  : 'debug',
                "silent" : false
            }),
            new (winston.transports.File)({
                json: false,
                filename: process.cwd() + '/var/log/' + this.contextName + '.master.log'
            })
        ]
    };

    this.stats = {
        crashs  : [],
        metrics : {}
    };

    var loggerConf = extend(true, defaultLoggerConf, options.logger || {});
    this.logger    = new winston.Logger(loggerConf);
    greppy.logger  = global.logger = this.logger;

    // Set environment if not given
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    logger.info('Current environment is ' + process.env.NODE_ENV.bold.green);

    var defaultWorkerConf = {
        amount         : 2,
        implementation : process.cwd() + '/app/worker.js',
        args           : []
    }

    // Setup the IPC pool
    this.ipc = new MasterIPC(this);

    // Setup worker configuration
    var workerConf = extend(true, defaultWorkerConf, options.worker || {});
    workerConf.args.push('--context', this.contextName);

    if (self.cliArgs.options.debug) {
        workerConf.args.push('--debug');
    }

    // Configure the cluster master
    cluster.setupMaster({
        exec : workerConf.implementation,
        args : workerConf.args
    });

    logger.info(
        'Starting the cluster ('
        + (workerConf.amount + ' worker(s)').green.bold
        + ')'
    );

    // Fork Event
    cluster.on('fork', function (worker) {

        // Add worker to the IPC pool
        self.ipc.addProcess(worker);

        logger.info(
            'Started new worker process ('
            + new String(worker.process.pid).green.bold + ')'
        );
    });

    // Exit Event
    cluster.on('exit', function(worker, code, signal) {

        // Remove pid from the IPC pool
        self.ipc.removeProcess(worker.process.pid);

        // If we got an zero, no error occured so its
        // not a crash. If we got no crash, and none
        // workers left the master shutdown, too.
        if (((!self.gracefullShutdown) &&
            (0 != worker.process.exitCode && 130 != worker.process.exitCode) &&
            (!self.cliArgs.options.debug)) ||
            (self.gracefullReboot)) {

            // Reset marker
            self.gracefullReboot = false;
            self.gracefullShutdown = false;

            logger.warn(
                'Worker process ('
                 + new String(worker.process.pid).green.bold
                 + ') died with error code: '
                 + new String(worker.process.exitCode).green.bold
            );

            // Write the crash/exit to our stats
            self.stats.crashs.push({
                occurredAt : new Date(),
                pid        : worker.process.pid,
                exitCode   : worker.process.exitCode
            });

            // Spawn a new worker process
            cluster.fork();

            return;
        }

        logger.info(
            'Worker process ('
             + new String(worker.process.pid).green.bold
             + ') exited successfully'
        );
    });

    // Just fork the workers
    for (var i = 0; i < workerConf.amount; i++) {
        cluster.fork({
            logger: logger
        });
    }

    var emitGracefullShutdown = function()
    {
        logger.info('Catched SIGTERM/SIGINT - emit gracefull shutdown to all cluster workers\n');
        self.gracefullShutdown = true;
        self.ipc.broadcast('gracefull.shutdown');
    }

    var emitGracefullReboot = function()
    {
        if (self.cliArgs.options.debug) {
            (new (require('../console'))()).clear();
        }

        logger.info('Catched SIGHUP - emit gracefull shutdown and reboot to all cluster workers\n');
        self.gracefullReboot = true;
        self.ipc.broadcast('gracefull.shutdown');
    }

    // Bind signals
    process.on('SIGINT', emitGracefullShutdown);
    process.on('SIGTERM ', emitGracefullShutdown);
    process.on('SIGHUP', emitGracefullReboot);
}

/**
 * Get the master IPC implementation object.
 *
 * @return IPC Object
 */
Master.prototype.getIPC = function()
{
    return this.ipc;
}

/**
 * Get the master cluster object.
 *
 * @return Cluster Object
 */
Master.prototype.getCluster = function()
{
    return cluster;
}

/**
 * Get the master commandline interface arguments.
 *
 * @return {Object}
 */
Master.prototype.getCliArgs = function()
{
    return this.cliArgs;
}

module.exports = Master;

