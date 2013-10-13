/**
 * Inter-process Communication Logger
 *
 * @module greppy/app/cluster/worker/ipc/logger
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util    = require('util');
var winston = require('winston');

/**
 * @constructor
 */
var IPCLogger = winston.transports.IPCLogger = function (options)
{
    this.name   = 'IPCLogger';
    this.level  = options.level || 'info';
    this.worker = options.worker;
};

/**
 * Extend the Winston transport class
 */
util.inherits(IPCLogger, winston.Transport);

/**
 * Implementation of the Winston transport API.
 * This method calls with the help of the worker
 * IPC stack the master process for logging.
 */
IPCLogger.prototype.log = function (level, msg, meta, callback)
{
    this.worker.getIPC().request('logger.log', {
        level : level,
        msg   : msg,
        meta  : meta
    });

    callback(null, true);
};

module.exports = IPCLogger;

