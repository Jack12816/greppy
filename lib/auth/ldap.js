/**
 * LDAP Auth Adapter
 *
 * @module greppy/auth/ldap
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var LDAPAuth = function(options)
{
    this.options    = options;
    this.connection = undefined;
}

/**
 * Connect to the configured LDAP server.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
LDAPAuth.prototype.connect = function(callback)
{
    logger.info('Try to establish a connection to LDAP server (' + this.options.url.green.bold + ')')
    this.connection = (require('ldapjs')).createClient(this.options);
    this.connection.bind(this.options.auth.authDn, this.options.auth.password, callback);
}

/**
 * Close the connection.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
LDAPAuth.prototype.close = function(callback)
{
    if (this.connection) {
        this.connection.unbind(callback);
        return;
    }

    callback && callback();
}

/**
 * Try to authentificate to the configured LDAP server.
 *
 * @param {String} authDn - Authentification DN
 * @param {String} password - Password for the DN
 * @param {Function} callback - Function to call on finish
 * @return void
 */
LDAPAuth.prototype.check = function(authDn, password, callback)
{
    var connection = (require('ldapjs')).createClient(this.options);

    connection.bind(authDn, password, function(err, client) {

        if (err) {
            logger.warn('LDAP auth failed for ' + authDn.green.bold + '. Details: ' + err.message);
            callback && callback(undefined, false);
            return;
        }

        connection.unbind();

        callback && callback(undefined, true);
    });
}

/**
 * Search for a given query.
 *
 * @param {String} query - Query DN
 * @param {Object} options - Options for the query
 * @param {Function} callback - Function to call on finish
 * @return void
 */
LDAPAuth.prototype.search = function(query, options, callback)
{
    if (!this.connection) {
        callback && callback('The connection is not established');
        return;
    }

    this.connection.search(query, options, function(err, res) {

        if (err) {
            callback && callback(err);
            return;
        }

        var results = [];

        res.on('error', function(err) {
            logger.error('LDAP Request faild. Details: '
                + JSON.stringify(err));
            callback && callback(err);
        });

        res.on('searchEntry', function(entry) {
            results.push(entry);
        });

        res.on('end', function(result) {
            callback && callback(undefined, results);
        });
    });
}

/**
 * Strip results to their attributes.
 *
 * @param {Array} results - Results array
 * @return {Array}
 */
LDAPAuth.prototype.resultsToJSON = function(results)
{
    var stripped = [];

    results.forEach(function(result) {

        if (!result.attributes) {
            return;
        }

        var res = {};

        result.attributes.forEach(function(attr) {

            res[attr.type] = attr.vals;

            if (1 === attr.vals.length) {
                res[attr.type] = attr.vals[0];
            }
        });

        stripped.push(res);
    });

    return stripped;
}

module.exports = LDAPAuth;

