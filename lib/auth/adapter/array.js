/**
 * Array Authentication Adapter
 *
 * This authentication adapter authenticates users against a passed array.
 *
 * @module greppy/auth/adapter/array
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the array authentication adapter
 */
var ArrayAuthAdapter = function(options)
{
    this.name    = 'array';
    this.options = options || {};
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

        return callback && callback(new Error(
            'ArrayAuthAdapter has not been provided with a valid array'
        ));
    }

    if (this.options.users.some(function(element, index, array) {
        return user === element.username && credentials === element.password;
    })) {
        return callback && callback(undefined, true);
    } else {
        return callback && callback(undefined, false);
    }
};

module.exports = ArrayAuthAdapter;

