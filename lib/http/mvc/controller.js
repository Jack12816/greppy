/**
 * Base Controller
 *
 * @module greppy/http/mvc/controller
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var path = require('path');

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

    this.actions  = {};
    this.viewPath = '';

    this.error    = greppy.helper.get('controller.error');
    this.form     = greppy.helper.get('controller.form');
    this.dataGrid = greppy.helper.get('controller.data-grid');
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

/**
 * Build a view path by a given file.
 *
 * @param {String} file - Name of the view file
 * @return {String}
 */
BaseController.prototype.view = function(file)
{
    return path.normalize(this.viewPath + '/' + file);
}

/**
 * Build a link to an action.
 *
 * @param {String} action - Name of the action to link to
 * @param {Object} params - Parameters object
 * @return {String}
 */
BaseController.prototype.link = function(action, params)
{
    if (!this.actions.hasOwnProperty(action)) {
        throw new Error(
            'Action "' + action + '" is not registered for the controller'
        );
        return;
    }

    var link = this.basePath + this.actions[action].path;

    if (params) {

        Object.keys(params).forEach(function(param) {
            link = link.replace(new RegExp(':' + param + '[\?]?', 'ig'), params[param]);
        });
    }

    return link;
}

module.exports = BaseController;

