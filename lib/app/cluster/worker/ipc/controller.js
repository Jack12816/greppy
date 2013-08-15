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
};

/**
 * Extend Greppy framework base controller
 */
util.inherits(IPCController, require('../../../../http/mvc/controller'));

/**
 * Get statistics from the IPC stack.
 *
 * @type {ControllerAction}
 * @public
 */
IPCController.prototype.actions.index =
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

/**
 * @type {ControllerOptions}
 */
IPCController.prototype.options = {
    path: '/cluster/slave'
};

module.exports = IPCController;

