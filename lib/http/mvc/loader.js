/**
 * Controller Loader
 *
 * @module greppy/http/mvc/loader
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var path = require('path');
var util = require('util');

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
        var pathHelper = new (require('../../helper/path'))();

        // Skip non existing paths
        if (!fs.existsSync(modulePath)) {
            return;
        }

        pathHelper.list(modulePath).forEach(function(fullPath) {

            if (!fullPath.match(/\.js$/i)) {
                return;
            }

            var controllerName = path.basename(fullPath.replace(/\.js$/g, ''));

            self.loadController(fullPath, controllerName, module);
        });
    });
};

/**
 * Load a given controller.
 *
 * @param {String} controllerPath - Path to the controller to load
 * @param {String} controllerName - Name the controller
 * @param {String} module - Name of the module to add the controller
 * @return void
 */
ControllerLoader.prototype.loadController = function(controllerPath, controllerName, moduleName)
{
    var self          = this;
    var controller    = require(controllerPath);
    var actions       = Object.keys(controller.actions);
    var canonicalPath = this.getCanonicalPath(controllerPath, controllerName, moduleName);

    // Store the loaded controller object
    self.controllers[canonicalPath] = controller;

    // Run the configure method of the current controller
    controller.configure(this.worker.app, this.worker.server, function(err) {

        var basePath = self.getBasePath(controller, controllerPath, controllerName, moduleName);

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

                // Check if the route is configured to be protected by an auth handler
                var auth = null;

                if (controller.options && controller.options.auth) {
                    auth = controller.options.auth.handler;
                }

                if (auth && null === controller.options.auth.routes) {
                    auth = null;
                }

                if (auth && util.isArray(controller.options.auth.routes)) {

                    if (0 !== controller.options.auth.routes.length) {

                        controller.options.auth.routes.forEach(function(authRoute) {

                            if (!authRoute instanceof RegExp) {
                                return;
                            }

                            if (null === path.match(authRoute)) {
                                auth = null;
                            }
                        });
                    }
                }

                // Register the routes to the worker context
                self.worker.context.routes.push({
                    method     : method,
                    path       : path,
                    module     : moduleName,
                    controller : controllerName,
                    action     : actionName,
                    auth       : auth,
                    callback   : action.action
                });
            });
        });
    });
}

/**
 * Gets the canonical path to store the controller.
 *
 * @param {String} fullPath - The full path to the controller file
 * @param {String} controllerName - Name of the controller
 * @param {String} moduleName - The name of the controller module
 * @returns {String}
 */
ControllerLoader.prototype.getCanonicalPath = function(fullPath, controllerName, moduleName)
{
    var path = (this.getRelativePath(fullPath, moduleName));

    path = path.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '.');
    path = moduleName + '.' + path;
    path = path.replace(/\.$/, '');
    path = path + '.' + controllerName;

    return path;
};

/**
 * Gets the base path for a given controller.
 *
 * @param {Object} controller - The controller object
 * @param {String} controllerName - Name of the controller
 * @param {String} fullPath - The full path to the controller file
 * @param {String} moduleName - The name of the controller module
 * @return {String} The complete base path of the controller
 */
ControllerLoader.prototype.getBasePath = function(controller, fullPath, controllerName, moduleName)
{
    if (controller.options && controller.options.path) {
        return controller.options.path;
    }

    var firstPath = this.getRelativePath(fullPath, moduleName);
    var lastPath  = ('index' == controllerName) ? '' : '/' + controllerName.replace(/\.js$/g, '');;

    return firstPath + lastPath;
};

/**
 * Gets the relative path of a controller.
 *
 * @param {String} fullPath - The full path to the controller file
 * @param {String} moduleName - The name of the controller module
 * @returns {String}
 */
ControllerLoader.prototype.getRelativePath = function(fullPath, moduleName)
{
    var modulePath     = process.cwd() + '/modules/' + moduleName + '/controllers';
    var controllerPath = path.dirname(fullPath);

    return controllerPath.replace(modulePath, '');
};

/**
 * Apply all routes to the given application.
 *
 * @param {Object} app - App to prepare
 * @return void
 */
ControllerLoader.prototype.configure = function(app)
{
    this.worker.context.routes.forEach(function(route) {

        if (route.auth) {
            return app[route.method.toLowerCase()](route.path, route.auth, route.callback);
        }

        app[route.method.toLowerCase()](route.path, route.callback);
    });
}

module.exports = ControllerLoader;

