/**
 * Base Authentication Handler
 *
 * This is the most basic authentication handler possible. It only calls the
 * "authenticate" method of the passed authentication handler.
 *
 * Specialised authentication handlers must inherit this base handler
 * and overwrite the "middleware" and "post" methods.
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
 * Do some preparation before the authentication and fetch the
 * representations of the user and credentials according to the
 * authentication adapter.
 *
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} next - Function to call when finished
 * @return void
 */
BaseAuthHandler.prototype.middleware = function(req, res, next)
{
    var username    = req.body.user || '';
    var credentials = req.body.credentials || '';

    this.process(username, credentials, next);
}

/**
 * Use a configured authentication adapter to authenticate.
 *
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} next - Function to call when finished
 * @return void
 */
BaseAuthHandler.prototype.process = function(username, credentials, callback)
{
    if (!this.options) {
        throw new Error('No options specified');
        return;
    }

    if (!this.options.adapter) {
        throw new Error('No adapter was specified as option');
        return;
    }

    if ('function' !== typeof this.options.adapter.authentication) {
        throw new Error('Specified adapter does not have a valie authentication method');
        return;
    }

    var self = this;

    this.options.adapter.authentication(username, credentials, function(err, isAuthenticated) {

        if (err) {

            if ('function' === typeof self.options.error) {
                self.options.error();
            }

            callback && callback(err);
            return;
        }

        logger.debug(
            'Authentification on ' + self.options.adapter.name.cyan
            + ' source ' + (isAuthenticated ? 'succeeded' : 'failed')
            + ' for ' + username
        );

        if (false === isAuthenticated && 'function' === typeof self.options.error) {
            self.options.error(username);
        }

        if (true === isAuthenticated && 'function' === typeof self.options.success) {
            self.options.success(username);
        }

        self.post(isAuthenticated, function() {
            return callback && callback(undefined, isAuthenticated);
        });
    });
};

/**
 * Do some postprocessing after the authentication.
 *
 * @param {Boolean} isAuthenticated - Authentication verified or not
 * @param {Function} callback - Function to call when finished
 * @return void
 */
BaseAuthHandler.prototype.post = function(isAuthenticated, callback)
{
    callback && callback();
}

module.exports = BaseAuthHandler;

