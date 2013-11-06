/**
 * Inter-cluster Communication Logger
 *
 * @module greppy/app/cluster/master/ipc/logger
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var winston = require('winston');
var moment  = require('moment');

/**
 * @constructor
 */
var Logger = function(options)
{
    this.master = options.master;

    var workerLoggerConf = {
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
                    return moment().format().yellow.bold + ' [Worker]'.white.bold;
                },
                "level"  : 'debug',
                "silent" : false
            }),
            new (winston.transports.File)({
                json: false,
                filename: process.cwd() + '/var/log/' + this.master.contextName + '.worker.log'
            })
        ]
    };

    // Setup winston logger
    this.default = new winston.Logger(workerLoggerConf);

    var workerRequestLoggerConf = {
        transports: [
            new (winston.transports.File)({
                json: false,
                filename: process.cwd() + '/var/log/' + greppy.context + '.access.log'
            })
        ]
    };

    // Setup winston request logger
    this.request = new winston.Logger(workerRequestLoggerConf);
};

/**
 * Log an given worker request with userdefined content.
 */
Logger.prototype.log = function(msg, options)
{
    if ('undefined' === typeof options.type) {
        options.type = 'default';
    }

    if (!this.hasOwnProperty(options.type)) {

        return this.default.log('error',
            'Logger "' + options.type + '" is not registered.'
        );
    }

    // Modify the log request for the default logger
    if ('default' === options.type) {

        options.msg = '[' + ('' + msg.reqPid).white + '] ' + options.msg;

        if ('debug' !== options.level && 'error' !== options.level) {
            options.msg = ' ' + options.msg;
        }
    }

    this[options.type].log(options.level, options.msg, options.meta);
};

module.exports = Logger;

