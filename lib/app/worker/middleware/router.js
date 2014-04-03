/**
 * Middleware - Router
 *
 * @module greppy/app/worker/middleware/router
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var RouterMiddleware = function()
{
};

/**
 * Append the router middleware to the given application stack.
 *
 * @param {Object} app - Application to configure
 * @param {function} callback - Function to call on finish
 */
RouterMiddleware.prototype.configure = function(app, callback)
{
    // Pull in the default router
    app.use(app.router);

    callback && callback();
};

module.exports = RouterMiddleware;

