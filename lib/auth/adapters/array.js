/**
 * Array Authentication Adapter
 *
 * This authentication adapter authenticates users against a passed array.
 *
 * @module greppy/auth/adapters/array
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the array authentication adapter
 */
var ArrayAuthAdapter = function(options)
{
    this.options = options || null;
};

/**
 * Authenticate a user with his credentials against an array.
 *
 * @param {String} user - Username
 * @param {String} credentials - Password
 * @param {Function} callback - Function to call when finished
 * @return void
 */
ArrayAuthAdapter.prototype.authentication = function(user, credentials, callback)
{
    if (! this.options.users instanceof Array || 0 === this.options.users.length) {

        var err = { message: 'ArrayAuthAdapter has not been provided with a valid array' };

        logger.error(err.message);
        callback && callback(err);
        return;
    }

    if (this.options.users.some(function(element, index, array) {
        return user === element.username && credentials === element.password;
    })) {

        logger.info('ArrayAuthAdapter authentification succeeded for ' + user.green.bold);
        callback && callback(undefined, true);
        return;
    } else {

        logger.warn('ArrayAuthAdapter authentification failed for ' + user.green.bold);
        callback && callback(undefined, false);
        return;
    }
};

module.exports = ArrayAuthAdapter;

