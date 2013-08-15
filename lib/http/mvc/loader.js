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
var ControllerLoader = function()
{
    this.controllers = {};
};

/**
 * Bootstrap routes for an given app object.
 *
 * @param {Array} modules - Modules to lookup
 * @param {Object} app - App to prepare
 * @return void
 */
ControllerLoader.prototype.load = function(modules, app)
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

            self.loadController(controllerPath, controllerName, module, app);
        });
    });
}

/**
 * Load a given controller into the given application.
 *
 * @param {String} controllerPath - Path to the controller to load
 * @param {String} controllerName - Name the controller
 * @param {String} module - Name of the module to add the controller
 * @param {Object} app - App to prepare
 * @return void
 */
ControllerLoader.prototype.loadController = function(controllerPath, controllerName, module, app)
{
    var self            = this;
    var ControllerClass = require(controllerPath);
    var controller      = new ControllerClass();
    var actions         = Object.keys(controller.actions);

    // Store the loaded controller object
    self.controllers[module + '.' + controllerName] = controller;

    var basePath = (controller.options && controller.options.path)
        ? controller.options.path
        : ('index' == controllerName) ? '/' : '/' + controllerName.replace(/\.js$/g, '');

    actions.forEach(function(actionName) {

        var action = controller.actions[actionName];

        if (!action.methods) {
            action.methods = ['GET', 'POST', 'PUT', 'DELETE'];
        }

        action.methods.forEach(function(method) {

            var actionPath = (action.path)
                ? action.path
                : ('index' == actionName) ? '' : '/' + actionName;

            app[method.toLowerCase()](basePath + actionPath, action.action);

            logger.debug(
                'Registered route: [' + method.green.bold + '] '
                + basePath + actionPath
                + ' -> ' + module.blue + '::' + controllerName.red + '::' + actionName.yellow
            );
        });
    });
}

module.exports = ControllerLoader;

