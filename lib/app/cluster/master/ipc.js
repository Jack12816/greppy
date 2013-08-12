/**
 * Inter-process Communication
 *
 * @module greppy/app/cluster/master/ipc
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs = require('fs');

/**
 * @constructor
 *
 * @param {Object} master - Master Object to bind upon
 */
var IPC = function(master)
{
    var self = this;

    this.methods   = {};
    this.processes = {};
    this.master    = master;

    // Inject predefined methods
    var defaultIPCPath = __dirname + '/ipc/';
    fs.readdirSync(defaultIPCPath).forEach(function(file) {

        if (!file.match(/\.js$/)) {
            return;
        }

        var ObjectClass = require(defaultIPCPath + file);
        var obj         = new ObjectClass({master: master});
        var className   = file.replace(/\.js$/i, '');

        Object.getOwnPropertyNames(ObjectClass.prototype).forEach(function(method) {

            if ('constructor' === method) {
                return;
            }

            self.addMethod(className + '.' + method, obj[method], obj);
        });
    });
}

/**
 * Add a given process to the IPC pool.
 *
 * @param {Object} proc - Worker object to add
 * @return void
 */
IPC.prototype.addProcess = function(proc)
{
    var self = this;

    this.processes[proc.process.pid] = proc;
    this.processes[proc.process.pid].on('message', function (msg) {

        var ipcMethod = self.methods[msg.method];

        if (!ipcMethod) {

            logger.warn(
                '[IPC]'.cyan
                + ' Method "' + msg.method + '" called but not registered'
            );
            return;
        }

        var args = [msg, msg.args];

        args.push(function(err, result) {
            self.respond(msg, err, result);
        });

        ipcMethod.method.apply(ipcMethod.thisArg, args);
    });
}

/**
 * Remove an worker by process-id from the IPC pool.
 *
 * @param {Integer} pid - Process-Id of the worker to remove
 * @return void
 */
IPC.prototype.removeProcess = function(pid)
{
    delete this.processes[pid];
}

/**
 * Add an method to the IPC stack.
 *
 * @param {String} name - Name of the method
 * @param {Function} method - Function which should be called on request
 * @return void
 */
IPC.prototype.addMethod = function(name, method, thisArg)
{
    if ('string' !== typeof name) {
        throw new TypeError('Methodname is not a string.');
        return;
    }

    if ('function' !== typeof method) {
        throw new TypeError('Method is not a function.');
        return;
    }

    this.methods[name] = {
        method  : method,
        thisArg : thisArg || null
    };
}

/**
 * Do an request to an registered worker process on the IPC pool.
 *
 * @param {Integer} pid - Process-Id of the worker to remove
 * @param {String} name - Name of the method
 * @param {Mixed} args - Argument(s) to pass to the method, Objects are prefered
 * @return void
 */
IPC.prototype.request = function(pid, name, args)
{
    if (!this.processes[pid]) {
        throw new Error('No process (' + pid + ') registered.');
        return;
    }

    this.call(pid, {
        reqPid : process.pid,
        method : name,
        args   : args,
        type   : 'request'
    });
}

/**
 * Respond to a given request message.
 *
 * @param {Object} message - Request message object
 * @param {Mixed} error - Error if any occured
 * @param {Mixed} result - Result of the operation
 * @return void
 */
IPC.prototype.respond = function(message, error, result)
{
    message.error  = error;
    message.result = result;
    message.resPid = process.pid;
    message.type   = 'response';

    this.call(message.reqPid, message);
}

/**
 * Low-level call of Node.js process communication API.
 * It simply wraps the "process.send()" method.
 *
 * @param {Integer} pid - Process-Id of the worker to remove
 * @param {Object} message - Message object to send
 * @return void
 */
IPC.prototype.call = function(pid, message)
{
    this.processes[pid].process.send(message);
}

/**
 * Broadcast a message with args if needed to all registered workers
 * on the IPC pool.
 *
 * @param {String} name - Process-Id of the worker to remove
 * @param {Mixed} args - Message object to send
 * @return void
 */
IPC.prototype.broadcast = function(name, args)
{
    var self = this;

    Object.keys(this.processes).forEach(function(pid) {
        self.request(self.processes[pid].process.pid, name, args);
    });
}

module.exports = IPC;

