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
    var self = this;

    this.options = {
        path: '',
        auth: {
            handler: null,
            routes: null
        }
    };

    this.actions  = {};
    this.viewPath = '';

    // Load all Greppy controller helpers dynamically
    greppy.helper.list().forEach(function(itm) {

        // load only controller helpers
        if (!/^controller\./.test(itm)) {
            return;
        }

        var helper = itm.split('.');
        helper.shift();
        helper = helper.pop();
        self[helper.toCamelCase()] = greppy.helper.get(itm);
    });
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
 * @param {String} [absoluteUrl] - If given, it will be prefixed
 * @return {String}
 */
BaseController.prototype.link = function(action, params, absoluteUrl)
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

    link = link.replace(/[/]+/gi, '/');

    return (absoluteUrl) ? absoluteUrl + link : link;
}

module.exports = BaseController;

