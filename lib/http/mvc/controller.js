/**
 * Base Controller
 *
 * @module greppy/http/mvc/controller
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var BaseController = function()
{
};

/**
 * Controller options.
 *
 * @type {ControllerOptions}
 */
BaseController.prototype.options = {};

/**
 * Controller actions pool.
 *
 * @type {ControllerActionsPool}
 */
BaseController.prototype.actions = {};

module.exports = BaseController;

