/**
 * Inter-process Communication
 *
 * @module greppy/app/cluster/master/ipc
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var IPC = function()
{
    var self       = this;
    this.callbacks = {};

    process.on('message', function(msg) {

        var callback = self.callbacks[msg.method];

        if (callback) {
            callback.apply(self, [msg.error, msg.result, msg]);
        }
    });
}

/**
 * Add an listener for an specific IPC broadcast request.
 *
 * @param {String} name - Name of the broadcast message
 * @param {Function} callback - Function to call on an given IPC broadcast request
 */
IPC.prototype.addBroadcastListener = function(type, callback)
{
    this.callbacks[type] = callback;
}

/**
 * Do an IPC request on the cluster master.
 *
 * @param {String} method - Name of the method
 * @param {Mixed} args - Argument(s) to pass to the method, Objects are prefered
 * @param {Function} [callback] - Function to call on an given IPC response
 */
IPC.prototype.request = function(method, args, callback)
{
    if (callback) {
        this.callbacks[method] = callback;
    }

    this.call({
        reqPid : process.pid,
        method : method,
        args   : args,
        type   : 'request'
    });
}

/**
 * Low-level call of Node.js process communication API.
 * It simply wraps the "process.send()" method.
 *
 * @param {Object} message - Message object to send
 */
IPC.prototype.call = function(message)
{
    process.send(message);
}

module.exports = IPC;

