/**
 * Controller Loader
 *
 * @module greppy/http/mvc/loader
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

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

        fs.readdirSync(modulePath).forEach(function(controllerName) {

            if (!controllerName.match(/\.js$/)) {
                return;
            }

            logger.info('[ControllerLoader]'.cyan + ' Load %s module', module);

            var ControllerClass = require(modulePath + controllerName);
            var controller      = new ControllerClass();
            var actions         = Object.keys(controller.actions);
            var controllerName  = controllerName.replace(/\.js$/g, '');

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
                        'Registered route: [' + method + '] '
                        + basePath + actionPath
                        + ' -> ' + module + '::' + controllerName + '::' + actionName
                    );
                });
            });
        });
    });
}

module.exports = ControllerLoader;

