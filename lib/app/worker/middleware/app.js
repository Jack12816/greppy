/**
 * Middleware - App
 *
 * @module greppy/app/worker/middleware/app
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var _ = require('lodash-node');

/**
 * @constructor
 *
 * @param {Object} baseApp - Greppy base application instance
 */
var AppMiddleware = function(baseApp)
{
    this.baseApp = baseApp;
};

/**
 * Append the app middleware to the given application stack.
 *
 * @param {Object} app - Application to configure
 * @param {function} callback - Function to call on finish
 */
AppMiddleware.prototype.configure = function(app, callback)
{
    var self = this;

    app.use(function greppyApp(req, res, next) {

        // Add lodash to the view
        res.locals._ = _;

        // Add variables to the view
        res.locals.req = req;

        // Add app object to the response locals
        res.locals.app = {
            link        : self.baseApp.link.bind(self.baseApp),
            linkContext : self.baseApp.linkContext.bind(self.baseApp),
            host        : req.greppy.route.host,
            url         : req.greppy.route.url,
            env         : process.env.NODE_ENV
        };

        // Add linking functionality to the application
        res.link        = self.baseApp.link.bind(self.baseApp);
        res.linkContext = self.baseApp.linkContext.bind(self.baseApp);

        next();
    });

    callback && callback();
};

module.exports = AppMiddleware;

