/**
 * Process Helper
 *
 * @module greppy/helper/process
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util   = require('util');
var fs     = require('fs');
var number = require('../extension/datatype/number');

/**
 * @constructor
 */
var Process = function()
{
}

/**
 * Find all child process ids for a given process id.
 *
 * @param {String} pid - Parent pid to search childs for
 * @return {Array}
 */
Process.prototype.findChilds = function(pid)
{
    var childs = [];

    fs.readdirSync('/proc').forEach(function(proc) {

        if (!proc.match(/^[0-9]*$/) && pid != proc) {
            return;
        }

        if (!fs.existsSync('/proc/' + proc + '/stat')) {
            return;
        }

        var stat = fs.readFileSync('/proc/' + proc + '/stat', 'ascii');
        var parent = stat.split(' ')[3];

        if (pid == parent) {
            childs.push(proc);
        }
    });

    return childs;
}

/**
 * Get the memory usage of the given process ids.
 *
 * @param {Array} pids - Pids to get memory usage for
 * @return {Object}
 */
Process.prototype.getMemoryUsage = function(pids)
{
    var results = [];
    var total   = 0;

    pids.forEach(function(pid) {

        if (!fs.existsSync('/proc/' + pid + '/status')) {
            return;
        }

        var status = fs.readFileSync('/proc/' + pid + '/status', 'ascii');
        var rss    = (new RegExp('^VmRSS:(.+)', 'mgi')).exec(status);
        rss        = (rss) ? rss[1] : '0';
        rss        = rss.split(new RegExp('\\s')).slice(-2)[0];

        results.push({
            pid   : pid,
            usage : new Number(rss * 1024).memory()
        });

        total += rss * 1024;
    });

    results.push({
        usage: new Number(total).memory()
    });

    return results;
};

/**
 * Check if the given process id exists and is running.
 *
 * @param {Integer} pid - Process id
 * @return {Boolean}
 */
Process.prototype.isRunning = function(pid)
{
    if (!fs.existsSync('/proc/' + pid + '/status')) {
        return false;
    }

    return true;
}

/**
 * Get the path to the process id file of a context.
 *
 * @param {String} path - Path to the application
 * @param {String} context - Name of the context
 * @return {String}
 */
Process.prototype.getPidPathForContext = function(path, context)
{
    return (require('path')).normalize(path + '/var/run/' + context + '.pid');
}

/**
 * Get the process for a given context.
 *
 * @param {String} path - Path of the application
 * @param {String} context - Name of the context to check
 * @return {Integer|Boolean}
 */
Process.prototype.getPidForContext = function(path, context)
{
    var path = this.getPidPathForContext(path, context);

    if (!fs.existsSync(path) || !fs.statSync(path).isFile()) {
        return false;
    }

    return fs.readFileSync(path, 'utf8');
}

/**
 * Check if the given context is running.
 *
 * @param {String} path - Path of the application
 * @param {String} context - Name of the context to check
 * @return {Boolean}
 */
Process.prototype.isContextRunning = function(path, context)
{
    var path = this.getPidPathForContext(path, context);

    if (!fs.existsSync(path) || !fs.statSync(path).isFile()) {
        return false;
    }

    return this.isRunning(fs.readFileSync(path, 'utf8'));
}

/**
 * Get the state as object for a given context.
 *
 * @param {String} path - Path of the application
 * @param {String} context - Name of the context to check
 * @return {Object}
 */
Process.prototype.getContextState = function(path, context)
{
    return {
        name    : context,
        running : this.isContextRunning(path, context),
        pid     : this.getPidForContext(path, context),
        file    : this.getPidPathForContext(path, context)
    };
}

/**
 * Kill a process by it's id.
 *
 * @param {Integer} pid - Process id to kill
 * @param {Integer|String} [signal] - Signal to send (default: SIGINT|2)
 * @param {Function} callback - Function to call on finish
 */
Process.prototype.kill = function(pid, signal, callback)
{
    if ('function' === typeof signal) {
        callback = signal;
        signal   = 2;
    }

    var child = (require('child_process')).spawn('kill', [
        '-' + new String(signal), pid
    ]);

    child.on('close', function(code) {

        if (0 == code) {
            return callback && callback();
        }

        return callback && callback(code);
    });
}

module.exports = Process;

