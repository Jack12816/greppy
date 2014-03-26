/**
 * Controller Loader
 *
 * @module greppy/http/mvc/loader
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var async     = require('async');
var util      = require('util');
var basename  = require('path').basename;
var dirname   = require('path').dirname;
var normalize = require('path').normalize;

/**
 * @constructor
 */
var ControllerLoader = function(worker)
{
    this.controllers = {};
    this.worker      = worker;
};

/**
 * Gets the relative path of a controller.
 *
 * @param {String} path - The full path to the controller file
 * @param {String} module - The name of the controller module
 * @returns {String}
 */
ControllerLoader.prototype.getRelativePath = function(path, module)
{
    var modulePath = process.cwd() + '/modules/' + module + '/controllers';
    var path       = dirname(path);

    // Replace internal paths
    if (-1 !== path.indexOf(normalize(__dirname + '/../../../'))) {
        path = path.replace(path, '');
    }

    return path.replace(modulePath, '');
};

/**
 * Gets the canonical path to store the controller.
 *
 * @param {String} path - The full path to the controller file
 * @param {String} controller - Name of the controller
 * @param {String} module - The name of the controller module
 * @returns {String}
 */
ControllerLoader.prototype.getCanonicalPath = function(path, controller, module)
{
    path = this.getRelativePath(path, module)
               .replace(/^\//, '')
               .replace(/\/$/, '')
               .replace(/\//g, '.');

    path = (module + '.' + path)
        .replace(/\.$/, '') +
        '.' + controller;

    return path;
};

/**
 * Gets the base path for a given controller.
 *
 * @param {Object} controller - The controller object
 * @param {String} path - The full path to the controller file
 * @param {String} module - The name of the controller module
 * @return {String} The complete base path of the controller
 */
ControllerLoader.prototype.getBasePath = function(controller, path, module)
{

    if (controller.options && controller.options.path) {
        return controller.options.path;
    }

    var firstPath = this.getRelativePath(path, module);
    var lastPath  = ('index' === controller.name)
        ? ''
        : '/' + controller.name.replace(/\.js$/g, '');

    return firstPath + lastPath;
};

/**
 * Prepare actions for a given controller object.
 *
 * @param {Object} controller - Controller to prepare
 * @param {Function} callback - Function to call on finish
 */
ControllerLoader.prototype.prepareControllerActions = function(controller, callback)
{
    // Just setup a clean output object
    var preparedActions = [];

    // Allow action less controllers
    if (!controller.actions) {
        return callback(null, preparedActions);
    }

    async.each(Object.keys(controller.actions || []), function(name, callback) {

        // Setup an internal alias of the action object
        var action = controller.actions[name];

        // If no explicit method(-array) was specified
        // we use the default set
        if (!action.methods) {
            action.methods = ['GET', 'POST', 'PUT', 'DELETE'];
        }

        var actionPath = (action.path)
            ? action.path
            : ('index' == name) ? '' : '/' + name;

        if (!action.path) {
            action.path = actionPath;
        }

        // Build really clean route paths
        var path = ((controller.basePath + actionPath)
                   .replace(/\/+/gi, '/')
                   .replace(/\/$/gi, '')) || '/';

        // Check if the route is configured
        // to be protected by an auth handler
        var auth = null;

        // Setup any authentication options
        if (controller.options && controller.options.auth) {

            var handler = controller.options.auth.handler;

            // We found a simple handler - as a direct function
            // so we can use it as it is
            if ('function' === typeof handler) {
                auth = handler;
            }

            // Our found handler seems to be an object, in
            // this case we should check for a middleware
            // function. If this middleware is present lets
            // bind it
            if (handler && 'function' === typeof handler.middleware) {
                auth = function() {
                    handler.middleware.apply(handler, arguments);
                };
            }
        }

        // Disable authentication if the client has explicit
        // specified to use the handler for no route (null)
        if (auth && null === controller.options.auth.routes) {
            auth = null;
        }

        // Authentication routes are specified by the client
        // to walk through them
        if (auth &&
            util.isArray(controller.options.auth.routes) &&
            0 !== controller.options.auth.routes.length) {

            controller.options.auth.routes.forEach(function(authRoute) {

                if (!authRoute instanceof RegExp) {
                    return;
                }

                if (null === path.match(authRoute)) {
                    auth = null;
                }
            });
        }

        // Add the current action (in combination with all
        // configured HTTP methods) to the output set
        action.methods.forEach(function(method) {
            preparedActions.push({
                thisArg        : controller,
                method         : method,
                path           : path,
                module         : controller.module,
                controller     : controller.name,
                controllerPath : controller.canonicalPath.replace(controller.module + '.', ''),
                action         : name,
                auth           : auth,
                callback       : action.action
            });
        });

        callback();

    }, function(err) {

        if (err) {
            return callback && callback(err);
        }

        // Sort the actions - static routes first
        preparedActions.sort(function(a, b) {

            a = a.path.split(':').length - 1;
            b = b.path.split(':').length - 1;

            if (a < b) {
                return -1;
            }

            if (a > b) {
                return 1;
            }

            return 0;
        });

        callback && callback(null, preparedActions);
    });
};

/**
 * Load a given controller.
 *
 * @param {String} path - Path to the controller to load
 * @param {String} name - Name the controller
 * @param {String} module - Name of the module to add the controller
 * @param {Function} callback - Function to call on finish
 */
ControllerLoader.prototype.loadController = function(path, name, module, callback)
{
    var self = this;

    async.waterfall([

        // Prepare the controller
        function(callback) {

            try {
                var controller = require(path);
                callback(null, controller);
            } catch (e) {
                return callback(e);
            }
        },

        // Run the configure method of the current controller
        function(controller, callback) {

            // Allow configure-method less controllers
            if ('function' !== typeof controller.configure) {
                return callback(null, controller);
            }

            controller.configure(
                self.worker.app,
                self.worker.server,
            function(err) {
                callback(err, controller);
            });
        },

        // Run any options generation
        function(controller, callback) {

            // Add the given name to the controller
            controller.name = name;
            controller.module = module;

            // Set default value on the controller instance
            controller.basePath = self.getBasePath(
                controller, path, module
            );

            // Add the canonical path
            controller.canonicalPath = self.getCanonicalPath(
                path, name, module
            );

            callback(null, controller);
        },

        // Prepare all actions of the controller
        function(controller, callback) {
            self.prepareControllerActions(controller, function(err, actions) {
                callback(err, controller, actions);
            });
        },

        // Register routes to the worker context
        function(controller, actions, callback) {
            self.worker.context.routes = self.worker.context.routes.concat(
                actions
            );
            callback(null, controller);
        }

    ], function(err, controller) {

        if (err) {
            return callback(err);
        }

        // Store the loaded controller object
        self.controllers[controller.canonicalPath] = controller;

        callback(null, controller);
    });
};

/**
 * Load routes for given modules.
 *
 * @param {Array} modules - Modules to lookup
 * @param {Function} callback - Function to call on finish
 */
ControllerLoader.prototype.load = function(modules, callback)
{
    if (!modules) {
        return callback(null, []);
    }

    var self = this;
    var pathHelper = new (require('../../helper/path'))();

    async.waterfall([

        // Build module paths
        function(callback) {
            async.map(modules, function(module, callback) {
                callback && callback(
                    null,
                    {
                        name: module,
                        path: process.cwd() + '/modules/' +
                              module + '/controllers/'
                    }
                );
            }, callback);
        },

        // Check for valid modules - paths
        function(map, callback) {
            async.filter(map, function(module, callback) {
                fs.exists(module.path, callback);
            }, function(map) {
                callback(null, map);
            });
        },

        // Search for javascript files
        function(map, callback) {

            // Walk through all modules in parallel
            async.map(map, function(module, callback) {

                // Filter all non-js files in parallel
                async.filter(
                    pathHelper.list(module.path),
                function(path, callback) {
                    callback(path.match(/\.js$/i));
                }, function(paths) {
                    module.paths = paths;
                    callback(null, module);
                });

            }, callback);
        },

        // Load controllers of the modules
        function(map, callback) {

            // Walk through all modules in parallel
            async.map(map, function(module, callback) {

                // Walk through all possible controllers of the module
                async.map(module.paths, function(path, callback) {

                    self.loadController(
                        path,
                        basename(path.replace(/\.js$/g, '')),
                        module.name,
                        callback
                    );

                }, function(err, controllers) {
                    module.controllers = controllers;
                    callback(err, module);
                });

            }, callback);
        }

    ], callback);
};

/**
 * Apply all routes to the given application.
 *
 * @param {Object} app - App to prepare
 */
ControllerLoader.prototype.configure = function(app)
{
    this.worker.context.routes.forEach(function(route) {

        // Prepare the action to be wrapped to enable
        // this referencing to the controller instance
        // and the default ability to use self
        var preparedAction = function() {
            self = route.thisArg;
            route.callback.apply(route.thisArg, arguments);
        };

        // Also prepare bundled static helpers to support
        // this and self referencing
        Object.keys(route.thisArg.helpers || []).forEach(function(helper) {

            var preparedHelper = route.thisArg.helpers[helper].bind(route.thisArg);

            route.thisArg.helpers[helper] = function() {
                self = route.thisArg;
                preparedHelper.apply(route.thisArg, arguments);
            };
        });

        if (route.auth) {
            return app[route.method.toLowerCase()](
                route.path, route.auth, preparedAction
            );
        }

        app[route.method.toLowerCase()](route.path, preparedAction);
    });
};

module.exports = ControllerLoader;

