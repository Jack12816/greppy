/**
 * Multi-Threading High Availability Application Worker
 *
 * @module greppy/app/cluster/worker
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util      = require('util');
var extend    = require('extend');
var AppWorker = require('../worker');
var WorkerIPC = require('./worker/ipc');
var IPCLogger = require('./worker/ipc/logger');

/**
 * @constructor
 *
 * @param {Object} app - Express application object
 * @param {Object} server - HTTP(S) server object
 * @param {Object} options - Options object
 * @param {Function} callback - Function to call on finish
 */
var Worker = function(app, server, options, callback)
{
    var self = this;

    // Setup IPC connection
    this.ipc = new WorkerIPC();

    // Setup the IPC logger transport
    var workerConf = {
        logger: {
            transports: [
                new (IPCLogger)({
                    worker    : this,
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
        }
    }

    // Extend the given worker configuration
    arguments[2] = extend(true, workerConf, arguments[2] || {});

    var setupWorker = function(callback)
    {
        // Bind POSIX and IPC signals
        self.ipc.addBroadcastListener('gracefull.shutdown', function() {

            // Close HTTP server
            self.server.close(function() {

                logger.info('HTTP server went offline - not accepting connections anymore');

                greppy.db.close(function() {

                    logger.info('Closed all backend connections');

                    // Shutdown the process, without errors
                    process.exit(0);
                });
            });
        });

        // Annotate the worker context to the master via IPC
        self.getIPC().request('worker.annotateContext', self.context);

        callback && callback();
    }

    // Call the super constructor
    Worker.super_.call(this, app, server, options, function() {
        setupWorker(callback);
    });
}

/**
 * Extend Greppy framework single threading worker
 */
util.inherits(Worker, AppWorker);

/**
 * Get the worker IPC implementation object.
 *
 * @return IPC Object
 */
Worker.prototype.getIPC = function()
{
    return this.ipc;
};

module.exports = Worker;

