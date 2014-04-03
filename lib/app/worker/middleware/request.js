/**
 * Middleware - Request
 *
 * @module greppy/app/worker/middleware/request
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util = require('util');

/**
 * @constructor
 */
var RequestMiddleware = function(baseApp)
{
    this.baseApp = baseApp;
};

/**
 * Append the request middleware to the given application stack.
 *
 * @param {Object} app - Application to configure
 * @param {function} callback - Function to call on finish
 */
RequestMiddleware.prototype.configure = function(app, callback)
{
    var self = this;

    app.use(function greppyRequest(req, res, next) {

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

            var foundRoute = false;

            self.baseApp.context.routes.some(function(contextRoute) {
                if (req.method === contextRoute.method &&
                    route.path === contextRoute.path) {
                    req.greppy.route      = contextRoute;
                    res.locals.controller = contextRoute.thisArg;
                    foundRoute            = true;
                    return true;
                }
            });

            var requestLog = util.format(
                '%s request on %s',
                req.method.green.bold, req.url.cyan
            );

            if (true === foundRoute) {
                requestLog += util.format(
                    ' -> (%s::%s::%s)',
                    req.greppy.route.module.blue,
                    req.greppy.route.controllerPath.red,
                    req.greppy.route.action.yellow
                );
            }

            if ('POST' == req.method) {

                var data = {};

                Object.keys(req.body).forEach(function(key) {

                    if (-1 !== key.indexOf('password')) {
                        data[key] = '*************';
                        return;
                    }

                    data[key] = req.body[key];
                });

                requestLog += ' - Request data:\n' +
                    JSON.stringify(data, null, '  ').yellow;
            }

            logger.debug(requestLog);
        }

        // Write the full URL to the request
        req.greppy.route.host = req.protocol + "://" + req.get('host');
        req.greppy.route.url  = req.greppy.route.host + req.url;

        next();
    });

    callback && callback();
};

module.exports = RequestMiddleware;

