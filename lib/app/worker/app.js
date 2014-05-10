/**
 * Worker Default App Enhancements
 *
 * @module greppy/app/worker/app
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var async = require('async');

/**
 * @constructor
 *
 * @param {Object} worker - Worker object
 */
var App = function(worker)
{
    var self = this;

    this.context     = worker.context;
    this.worker      = worker;
    this.controllers = {};
    this.contexts    = greppy.config.get('app').get('infrastructure');
};

/**
 * Rebuild linking cache.
 */
App.prototype.rebuildLinkingCache = function()
{
    var self = this;

    // Build an controller names cache of all
    // registered routes of the worker context
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

        throw new Error(
            'Controller path "%s" is not registered. ' +
            'The following controller paths are registered: \n * %s'.format(
                controller,
                Object.keys(this.controllers).join('\n * ')
            )
        );
    }

    return this.controllers[controller].link(action, params, absoluteUrl);
};

/**
 * Build a link to a context.
 *
 * @param {String} context - Name of the context
 * @param {String} [path] - Path to suffix to the context link
 * @return {String}
 */
App.prototype.linkContext = function(context, path)
{
    if (!this.contexts.hasOwnProperty(context)) {
        throw new Error(
            'Context "%s" is not registered.'.format(context)
        );
    }

    var url = this.contexts[context].url || '/';

    // Add trailing slash if not yet present
    if (!/\/$/i.test(url)) {
        url += '/';
    }

    // Remove leading slash of path if given
    if (path) {
        path = path.replace(/\/+/gi, '/')
                   .replace(/^\//i, '');
    }

    return url + (path || '');
};

/**
 * Pre-Configure the given objects.
 *
 * @param {Object} app - Application to configure
 * @param {Object} server - Server to configure
 * @param {function} callback - Function to call on finish
 */
App.prototype.preConfigure = function(app, server, callback)
{
    var self = this;

    async.parallel([

        // @DEPRECATED: Remove this with Greppy 0.9
        // Load default middleware
        function(callback) {
            (new (require('./middleware/default'))()).configure(
                app, callback
            );
        },

        // Load parameters
        function(callback) {
            (new (require('./base/parameter'))()).configure(
                app, callback
            );
        },

        // Load view helpers
        function(callback) {
            (new (require('./base/view-helpers'))()).configure(
                app, callback
            );
        }

    ], function(err) {
        callback && callback(err);
    });
};

/**
 * Configure the given objects to fit the Greppy needs.
 *
 * @param {Object} app - Application to configure
 * @param {Object} server - Server to configure
 * @param {function} callback - Function to call on finish
 */
App.prototype.configure = function(app, server, callback)
{
    var self = this;

    async.waterfall([

        // Load request middleware
        function(callback) {
            (new (require('./middleware/request'))(self)).configure(
                app, callback
            );
        },

        // Load app middleware
        function(callback) {
            (new (require('./middleware/app'))(self)).configure(
                app, callback
            );
        }

    ], function(err) {
        callback && callback(err);
    });
};

/**
 * Post configure the given objects to fit the Greppy needs.
 *
 * @param {Object} app - Application to configure
 * @param {Object} server - Server to configure
 * @param {function} callback - Function to call on finish
 */
App.prototype.postConfigure = function(app, server, callback)
{
    var self = this;

    async.waterfall([

        // Load router middleware
        function(callback) {
            (new (require('./middleware/router'))()).configure(
                app, callback
            );
        }

    ], function(err) {
        callback && callback(err);
    });
};

module.exports = App;

