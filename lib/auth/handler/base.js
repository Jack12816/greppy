/**
 * Base Authentication Handler
 *
 * This is the most basic authentication handler possible. It only calls the
 * "authenticate" method of the passed authentication adapters.
 *
 * Specialised authentication handlers must inherit this base handler
 * and overwrite the "middleware" and "post" methods.
 *
 * @module greppy/auth/handler/base
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util  = require('util');
var async = require('async');

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
 */
BaseAuthHandler.prototype.middleware = function(req, res, next)
{
    var username    = req.body.user || '';
    var credentials = req.body.credentials || '';

    this.process(username, credentials, req, next);
};

/**
 * Use a configured authentication adapter to authenticate.
 *
 * @param {Object} username - The given username
 * @param {Object} credentials - The given password
 * @param {Object} req - The Request
 * @param {Function} next - Function to call when finished
 */
BaseAuthHandler.prototype.process = function(username, credentials, req, callback)
{
    if (!this.options) {
        throw new Error('No options specified');
    }

    if (!this.options.adapter) {
        throw new Error('No adapter(s) were specified as option');
    }

    var self = this;

    if (!util.isArray(this.options.adapter)) {
        this.options.adapter = [this.options.adapter];
    }

    async.map(this.options.adapter, function(adapter, callback) {

        if ('function' !== typeof adapter.authentication) {
            return callback && callback(
                new Error('Specified adapter does not have a valid authentication method')
            );
        }

        adapter.authentication(username, credentials, function(err, isAuthenticated, entity) {

            if (err) {
                return callback && callback(err);
            }

            if (entity && req.greppy) {

                if (!req.greppy.auth) {
                    req.greppy.auth = {};
                }

                req.greppy.auth.entity = entity;
            }

            callback && callback(null, isAuthenticated);
        });

    }, function(err, results) {

        if (err) {

            if ('function' === typeof self.options.error) {
                self.options.error();
            }

            return callback && callback(err);
        }

        var success = false;

        results.forEach(function(result) {

            if (true === result) {
                success = true;
            }
        });

        logger.debug(
            'Authentification ' + (success ? 'succeeded' : 'failed') +
            ' for ' + (username ? username.green.bold : '[none]')
        );

        if (false === success && 'function' === typeof self.options.error) {
            self.options.error(username);
        }

        if (true === success && 'function' === typeof self.options.success) {
            self.options.success(username);
        }

        self.post(success, function() {
            return callback && callback(null, success);
        });
    });
};

/**
 * Do some postprocessing after the authentication.
 *
 * @param {Boolean} isAuthenticated - Has the user been authenticated?
 * @param {Function} callback - Function to call when finished
 */
BaseAuthHandler.prototype.post = function(isAuthenticated, callback)
{
    callback && callback();
};

module.exports = BaseAuthHandler;

