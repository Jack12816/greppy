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
 * @type {ControllerOptions}
 */
BaseController.prototype.options = {};

/**
 *  Controller actions pool.
 *
 *  @namespace
 *  @type {ControllerActionsPool}
 *  @public
 */
BaseController.prototype.actions = {};

module.exports = BaseController;

