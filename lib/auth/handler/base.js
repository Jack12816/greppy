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
 * @module greppy/auth/handler/base
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the base authentication handler
 */
var BaseAuthHandler = function(options)
{
    this.options = options || {};
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

    if (!self.options ||
        !self.options.adapter ||
        !self.options.adapter.authentication ||
        self.options.adapter.authentication &&
        'function' !== typeof self.options.adapter.authentication) {

        var err = new Error('Authentication adapter: No valid authentication handler found');

        logger.error(err.message);

        if ('function' === typeof self.options.error) {
            self.options.error();
        }

        next && next(err);
        return;
    }

    self.preAuthentication(req, res, function(err, user, credentials) {

        self.options.adapter.authentication(user, credentials, function(err, isAuthenticated) {

            if (err) {

                if ('function' === typeof self.options.error) {
                    self.options.error();
                }

                next && next(err);
                return;
            }

            if (true === isAuthenticated) {

                logger.debug(
                    'Authentification on ' + self.options.adapter.name.cyan
                    + ' source succeeded for ' + user
                );

                if ('function' === typeof self.options.success) {
                    self.options.success();
                }

                self.postAuthentication(isAuthenticated, req, res, function() {
                    return next && next(undefined, true);
                });
            }

            logger.warn(
                'Authentification on ' + self.options.adapter.name.cyan
                + ' source failed for ' + user
            );

            if ('function' === typeof self.options.error) {
                self.options.error();
            }

            self.postAuthentication(isAuthenticated, req, res, function() {
                return next && next(undefined, false);
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

    callback && callback(undefined, user, credentials);
}

/**
 * Do some postprocessing after the authentication.
 *
 * @param {Boolean} isAuthenticated - Authentication verified or not
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} callback - Function to call when finished
 * @return void
 */
BaseAuthHandler.prototype.postAuthentication = function(isAuthenticated, req, res, callback)
{
    callback && callback();
}

module.exports = BaseAuthHandler;

