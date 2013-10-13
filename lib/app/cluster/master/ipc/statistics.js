/**
 * Inter-cluster Communication Statistics
 *
 * @module greppy/app/cluster/master/ipc/statistics
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs = require('fs');
var os = require('os');

/**
 * @constructor
 */
var Statistics = function(options)
{
    this.master = options.master;
};

/**
 * Notification of an worker metric change.
 *
 * @param {Object} msg - IPC message object
 * @param {Mixed} options - Options/arguments passed to the IPC request
 */
Statistics.prototype.notifyMetric = function(msg, options)
{
    var value = this.master.stats.metrics[options];

    if (!value) {
        value = 0;
    }

    this.master.stats.metrics[options] = ++value;
}

/**
 * Notification of an worker metric change.
 *
 * @param {Object} msg - IPC message object
 * @param {Mixed} options - Options/arguments passed to the IPC request
 * @param {Function} callback - Method for responses
 */
Statistics.prototype.getMetric = function(msg, options, callback)
{
    var value = this.master.stats.metrics[options];

    if (!value) {
        callback && callback('No metric information found for "' + options + '"');
        return;
    }

    callback && callback(null, value);
}

/**
 * Get all statistics in as object.
 *
 * @param {Object} msg - IPC message object
 * @param {Mixed} options - Options/arguments passed to the IPC request
 * @param {Function} callback - Method for responses
 */
Statistics.prototype.get = function(msg, options, callback)
{
    callback && callback(null, {
        context: {
            name          : this.master.cliArgs.options.context,
            metrics       : this.master.stats.metics,
            crashProtocol : this.master.stats.crashs,
            uptime        : process.uptime(),
            deployment    : this.getModuleDeployment()
        },
        system: {
            hostname : os.hostname(),
            port     : 77, // @todo,
            load     : function() {
                var l = fs.readFileSync('/proc/loadavg', 'ascii').split(' ');
                return {
                    now : l[0],
                    5   : l[1],
                    15  : l[2]
                };
            }(),
            memory  : this.getMemoryUsage(),
            version : process.versions
        }
    });
}

/**
 * Get deployment information from projects
 * package.json and the greppy version file.
 *
 * @return Object
 */
Statistics.prototype.getModuleDeployment = function()
{
    var package        = require(process.cwd() + '/package.json');
    var deployment     = require(process.cwd() + '/var/cache/version');
    deployment.version = package.version;

    return deployment;
}

/**
 * Get total cluster memory usage.
 *
 * @return Object
 */
Statistics.prototype.getMemoryUsage = function()
{
    var cluster = this.master.getCluster();
    var processes = [];

    var ram = function()
    {
        var l = fs.readFileSync('/proc/meminfo', 'ascii').split("\n");

        var getValue = function(str) {
            return str.replace(/ +(?= )/g,'').split(' ')[1] * 1024;
        }

        return {
            total : getValue(l[0]),
            free  : getValue(l[1])
        };
    }();

    // Add master statistics
    processes.push({
        type : 'master',
        pid  : process.pid,
        rss  : process.memoryUsage().rss
    });

    // Add worker statistics
    for (procId in cluster.workers) {

        var proc   = cluster.workers[procId];
        var status = fs.readFileSync('/proc/' + proc.process.pid + '/status', 'ascii');
        var rss    = (new RegExp('^VmRSS:(.+)', 'mgi')).exec(status)[1]
                     .split(new RegExp('\\s')).slice(-2)[0];

        processes.push({
            type : 'worker',
            pid  : proc.process.pid,
            rss  : (rss * 1024)
        });
    }

    return {
        processes : processes,
        ram       : ram
    };
};

module.exports = Statistics;

