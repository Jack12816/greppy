/**
 * Inter-process Communication Controller
 *
 * @module greppy/app/cluster/worker/ipc/controller
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var IPCController = function()
{
    // Call the super constructor
    IPCController.super_.call(this);
};

/**
 * Extend Greppy framework base controller
 */
util.inherits(IPCController, require('../../../../http/mvc/controller'));

/**
 * Configure the controller.
 *
 * @param {Object} app - The application object
 * @param {Object} server - Server object
 * @param {Function} callback - Function to call on finish
 */
IPCController.prototype.configure = function(app, server, callback)
{
    this.options.path = '/cluster/slave';

    callback && callback();
};

/**
 * Build the controller instance
 */
IPCController = new IPCController();

/**
 * Get statistics from the IPC stack.
 *
 * @type {ControllerAction}
 * @public
 */
IPCController.actions.index =
{
    path    : '/statistics',
    methods : ['GET'],
    action  : function(req, res) {

        greppy.worker.getIPC().request('statistics.get', null, function(err, result) {

            if (err) {
                res.json(500, err);
                return;
            }

            res.json(result);
        });
    }
};

module.exports = IPCController;

