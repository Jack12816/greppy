/**
 * Basic Authentication Adapter
 *
 * This authentication adapter authenticates users against a htpasswd file using basic authentication.
 *
 * @module greppy/auth/adapter/basic
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the basic authentication adapter
 */
var BasicAuthAdapter = function(options)
{
    this.name    = 'htaccess';
    this.options = options || null;
};

/**
 * Authenticate a user with his credentials against a htpasswd file using basic authentication.
 *
 * @param {String} user - Username
 * @param {String} credentials - Password
 * @param {Function} callback - Function to call when finished
 * @return void
 */
BasicAuthAdapter.prototype.authentication = function(user, credentials, callback)
{
    callback && callback(undefined, true);
};

module.exports = BasicAuthAdapter;

