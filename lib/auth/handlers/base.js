/**
 * Base Authentication Handler
 *
 * This is the most basic authentication handler possible. It only calls the
 * "authenticate" method of the passed authentication handler.
 *
 * Specialised authentication handlers must inherit this base handler and overwrite
 * the "preAuthentication(req, res, callback)" and "postAuthentication(req, res, callback)" methods.
 * Do not overwrite the "middleware(req, res, next)" method!
 *
 * @module greppy/auth/handlers/base
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the base authentication handler
 */
var BaseAuthHandler = function(options)
{
    this.options = options || null;
};

/**
 * Use a configured authentication adapter to authenticate.
 *
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} next - Function to call when finished
 * @return void
 */
BaseAuthHandler.prototype.middleware = function(req, res, next)
{
    var self = this;

    if (! self.options.adapter || ! self.options.adapter.authentication
        || self.options.adapter.authentication && 'function' !== typeof self.options.adapter.authentication) {

        var err = { message: 'Authentication adapter: No valid authentication handler found' };

        logger.error(err.message);

        if ('function' === typeof self.options.error) {
            self.options.error();
        }

        next && next(err);
        return;
    }

    self.preAuthentication(function(err, user, credentials) {

        self.options.adapter.authentication(user, credentials, function(err, isAuthenticated) {

            self.postAuthentication(function(err) {

                if (err) {

                    if ('function' === typeof self.options.error) {
                        self.options.error();
                    }

                    next && next(err);
                    return;
                }

                if (isAuthenticated) {

                    if ('function' === typeof self.options.success) {
                        self.options.success();
                    }

                    next && next(undefined, true);
                    return;

                }

                if ('function' === typeof self.options.error) {
                    self.options.error();
                }

                next && next(undefined, false);
                return;
            });
        });
    });
};

/**
 * Do some preparation before the authentication and fetch the representations of the user
 * and credentials according to the authentication adapter.
 *
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} callback - Function to call when finished
 * @return void
 */
BaseAuthHandler.prototype.preAuthentication = function(req, res, callback)
{
    var user        = req.body.user || '';
    var credentials = req.body.credentials || '';

    logger.debug('Authentication handler: Method "preAuthentication" not overwritten');
    callback && callback(undefined, user, credentials);
}

/**
 * Do some postprocessing after the authentication.
 *
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} callback - Function to call when finished
 * @return void
 */
BaseAuthHandler.prototype.postAuthentication = function(req, res, callback)
{
    logger.debug('Authentication handler: Method "postAuthentication" not overwritten');
    callback && callback(undefined);
}

module.exports = BaseAuthHandler;

