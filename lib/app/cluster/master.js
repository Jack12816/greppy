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
            })
        ]
    };

    this.stats = {
        crashs  : [],
        metrics : {}
    };

    // Setup winston logger
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
        if (0 != worker.process.exitCode && 130 != worker.process.exitCode) {

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
        logger.info('Catched signal - emit gracefull shutdown to all cluster workers');
        self.ipc.broadcast('gracefull.shutdown');
    }

    // Bind signals
    process.on('SIGINT', emitGracefullShutdown);
    process.on('SIGTERM ', emitGracefullShutdown);

    process.stdin.resume();
    process.stdin.setRawMode(true);

    process.stdin.on('data', function (data) {

        // F5
        if (String.fromCharCode(0x1b,0x5b,0x31,0x35,0x7e) == data) {
            console.log('f5 pressed.');
        }

        // Ctrl+C or Ctrl+D
        if ('\3' == data || '\4' == data) {
            process.stdin.pause();
            emitGracefullShutdown();
        }
    });
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

module.exports = Master;

