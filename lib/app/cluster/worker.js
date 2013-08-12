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
 */
var Worker = function()
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

    // Call the super constructor
    Worker.super_.apply(this, arguments);

    // Bind POSIX and IPC signals
    this.ipc.addBroadcastListener('gracefull.shutdown', function() {

        // Close HTTP server
        self.server.close(function() {

            logger.info('HTTP server went offline - not accepting connections anymore');

            // Shutdown the process, without errors
            process.exit(0);
        });
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

