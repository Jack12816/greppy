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
                    return moment().format().yellow.bold
                            + ' [Worker]'.white.bold;
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
    this.logger = new winston.Logger(workerLoggerConf);
};

/**
 * Log an given worker request with userdefined content.
 *
 * @return void
 */
Logger.prototype.log = function(msg, options)
{
    options.msg = '[' + new String(msg.reqPid).white + '] ' + options.msg;

    if ('debug' !== options.level && 'error' !== options.level) {
        options.msg = ' ' + options.msg;
    }

    this.logger.log(options.level, options.msg, options.meta);
}

module.exports = Logger;

