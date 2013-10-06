/**
 * Worker Default App Enhancements
 *
 * @module greppy/app/worker/app
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var express = require('express');

/**
 * @constructor
 *
 * @param {Object} context - Worker context
 */
var App = function(context)
{
    var self = this;

    this.context = context;
    this.controllers = {};

    this.context.routes.forEach(function(route) {
        self.controllers[route.controllerPath] = route.thisArg;
    });
};

/**
 * Build a link to a controller action.
 *
 * @param {String} controller - Controller path (eg. admin.users)
 * @param {String} action - Name of the action to link to
 * @param {Object} params - Parameters object
 * @param {String} [absoluteUrl] - If given, it will be prefixed
 * @return {String}
 */
App.prototype.link = function(controller, action, params, absoluteUrl)
{
    if (!this.controllers.hasOwnProperty(controller)) {
        throw new Error('Controller path "' + controller + '" is not registered.');
    }

    return this.controllers[controller].link(action, params, absoluteUrl);
};

/**
 * Configure the given objects to fit the Greppy needs.
 *
 * @param {Object} app - Application to configure
 * @param {Object} server - Server to configure
 * @param {function} callback - Function to call on finish
 * @return void
 */
App.prototype.configure = function(app, server, callback)
{
    var self = this;

    // Always use the body parser
    app.use(express.bodyParser());

    // Simple param regex validator
    app.param(function(name, fn) {

        if (fn instanceof RegExp) {

            return function(req, res, next, val) {

                var captures;

                if (captures = fn.exec(String(val))) {

                    if (1 === captures.length) {
                        req.params[name] = captures[0];
                    } else {
                        req.params[name] = captures;
                    }

                    next();

                } else {
                    next('route');
                }
            };
        }
    });

    // Default param mappings
    app.param('id', /^\d+$/);
    app.param('oid', /^[0-9a-f]{24}$/i);
    app.param('uuid', /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i);

    // Add default Greppy middleware
    app.use(function(req, res, next) {

        // Add Greppy request object
        req.greppy = {
            route: {}
        };

        // Pre match the route of the request
        // So we have to reconstruct the express router to
        // fit our needs.
        var route = null;

        (function pass(i, err) {

            var paramCallbacks;
            var paramIndex = 0;
            var paramVal;
            var keys;
            var key;

            // match next route
            function nextRoute(err) {
                pass(req._route_index + 1, err);
            }

            // match route
            req.route = route = app._router.matchRequest(req, i);
            if (!route) return;

            // we have a route
            // start at param 0
            req.params = route.params;
            keys = route.keys;
            i = 0;

            // param callbacks
            function param(err) {
                paramIndex     = 0;
                key            = keys[i++];
                paramVal       = key && req.params[key.name];
                paramCallbacks = key && app._router.params[key.name];

                try {
                    if ('route' == err) {
                        nextRoute();
                    } else if (err) {
                        i = 0;
                        callbacks(err);
                    } else if (paramCallbacks && undefined !== paramVal) {
                        paramCallback();
                    } else if (key) {
                        param();
                    }
                } catch (err) {
                    param(err);
                }
            }

            param(err);

            // single param callbacks
            function paramCallback(err) {
                var fn = paramCallbacks[paramIndex++];
                if (err || !fn) return param(err);
                fn(req, res, paramCallback, paramVal, key.name);
            }
        })(0);

        if (route && '/favicon.ico' !== req.url) {

            self.context.routes.some(function(contextRoute) {

                if (req.method === contextRoute.method) {
                    if (route.path === contextRoute.path) {

                        req.greppy.route      = contextRoute;
                        res.locals.controller = contextRoute.thisArg;
                        return true;
                    }
                }
            });

            var requestLog = req.method.green.bold + ' request on ' + req.url.cyan;

            if ('POST' == req.method) {

                var data = {};

                Object.keys(req.body).forEach(function(key) {

                    if (-1 !== key.indexOf('password')) {
                        data[key] = '*************';
                        return;
                    }

                    data[key] = req.body[key];
                });

                requestLog += ' - Request data:\n' + JSON.stringify(data, null, '  ').yellow;
            }

            logger.debug(requestLog);
        }

        // Write the full URL to the request
        req.greppy.route.host = req.protocol + "://" + req.get('host');
        req.greppy.route.url  = req.greppy.route.host + req.url;

        // Add variables to the view
        res.locals.req = req;

        // Add app object to the response locals
        res.locals.app = {
            link : self.link.bind(self),
            host : req.greppy.route.host,
            url  : req.greppy.route.url,
            env  : process.env.NODE_ENV
        };

        // Add linking functionality to the application
        res.link = self.link.bind(self);

        next();
    });

    // Pull in the default router
    app.use(app.router);

    // Run post configure hook
    if (app.postConfigure) {
        return app.postConfigure(app, server, callback);
    }

    callback && callback();
};

module.exports = App;

