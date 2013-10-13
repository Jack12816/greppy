/**
 * htpasswd Authentication Adapter
 *
 * This authentication adapter authenticates users
 * against a htpasswd file.
 *
 * @module greppy/auth/adapter/htpasswd
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs   = require('fs');
var pass = require('pass');

/**
 * @constructor
 * @param {Object} options - Options of the htpasswd authentication adapter
 */
var HtpasswdAuthAdapter = function(options)
{
    this.name    = 'htpasswd';
    this.options = options || {};

    this.cache = {};
    var self   = this;

    if (!options.file) {
        throw new Error('No file was specified to the options');
        return;
    }

    if (!fs.existsSync(options.file)) {
        throw new Error('File "' + options.file + '" does not exists');
        return;
    }

    if (!fs.statSync(options.file).isFile()) {
        throw new Error('File "' + options.file + '" is not a file');
        return;
    }

    fs.readFileSync(options.file, 'utf8').split('\n').forEach(function(line) {

        if ('' == line) {
            return;
        }

        var line = line.split(':');
        self.cache[line.shift()] = line.join(':');
    });
};

/**
 * Authenticate a user with his credentials against a htpasswd file.
 *
 * @param {String} user - Username
 * @param {String} credentials - Password
 * @param {Function} callback - Function to call when finished
 */
HtpasswdAuthAdapter.prototype.authentication = function(user, credentials, callback)
{
    if (!this.cache.hasOwnProperty(user)) {
        return callback && callback(null, false);
    }

    pass.validate(credentials, this.cache[user], function(err, success) {

        if (err || false === success) {
            return callback && callback(null, false);
        }

        callback && callback(null, true);
    });
};

module.exports = HtpasswdAuthAdapter;

