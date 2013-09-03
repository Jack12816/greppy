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
    this.options = {
        path: '',
        auth: {
            handler: null,
            routes: null
        }
    };

    this.actions = {};
};

/**
 * Configure the controller.
 *
 * @param {Object} app - The application object
 * @param {Object} server - Server object
 * @param {Function} callback - Function to call on finish
 * @return void
 */
BaseController.prototype.configure = function(app, server, callback)
{
    callback && callback();
};

module.exports = BaseController;

