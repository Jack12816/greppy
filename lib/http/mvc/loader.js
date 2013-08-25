/**
 * Controller Loader
 *
 * @module greppy/http/mvc/loader
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var path = require('path');

/**
 * @constructor
 */
var ControllerLoader = function(worker)
{
    this.controllers = {};
    this.worker      = worker;
};

/**
 * Load routes for given modules.
 *
 * @param {Array} modules - Modules to lookup
 * @return void
 */
ControllerLoader.prototype.load = function(modules)
{
    var self = this;

    modules.forEach(function(module) {

        var modulePath = process.cwd() + '/modules/' + module + '/controllers/';

        // Skip non existing paths
        if (!fs.existsSync(modulePath)) {
            return;
        }

        fs.readdirSync(modulePath).forEach(function(controllerName) {

            if (!controllerName.match(/\.js$/)) {
                return;
            }

            logger.info('Loading the ' + '%s'.blue + ' module', module);

            var controllerPath = modulePath + controllerName;
            var controllerName = path.basename(controllerPath).replace(/\.js$/g, '');

            self.loadController(controllerPath, controllerName, module);
        });
    });
}

/**
 * Load a given controller.
 *
 * @param {String} controllerPath - Path to the controller to load
 * @param {String} controllerName - Name the controller
 * @param {String} module - Name of the module to add the controller
 * @return void
 */
ControllerLoader.prototype.loadController = function(controllerPath, controllerName, module)
{
    var self            = this;
    var ControllerClass = require(controllerPath);
    var controller      = new ControllerClass();
    var actions         = Object.keys(controller.actions);

    // Store the loaded controller object
    self.controllers[module + '.' + controllerName] = controller;

    var basePath = (controller.options && controller.options.path)
        ? controller.options.path
        : ('index' == controllerName) ? '' : '/' + controllerName.replace(/\.js$/g, '');

    actions.forEach(function(actionName) {

        var action = controller.actions[actionName];

        if (!action.methods) {
            action.methods = ['GET', 'POST', 'PUT', 'DELETE'];
        }

        action.methods.forEach(function(method) {

            var actionPath = (action.path)
                ? action.path
                : ('index' == actionName) ? '' : '/' + actionName;

            // Build really clean route paths
            var path = basePath + actionPath;
            path     = path.replace(/\/+/gi, '/').replace(/\/$/gi, '');
            path     = path || '/';

            // Register the routes to the worker context
            self.worker.context.routes.push({
                method     : method,
                path       : path,
                module     : module,
                controller : controllerName,
                action     : actionName,
                callback   : action.action
            });
        });
    });
}

/**
 * Apply all routes to the given application.
 *
 * @param {Object} app - App to prepare
 * @return void
 */
ControllerLoader.prototype.configure = function(app)
{
    this.worker.context.routes.forEach(function(route) {
        app[route.method.toLowerCase()](route.path, route.callback);
    });
}

module.exports = ControllerLoader;

