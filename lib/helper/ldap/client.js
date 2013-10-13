/**
 * LDAP Client Helper
 *
 * @module greppy/helper/ldap/client
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the ldap client helper
 *                           {
 *                              ldap : // Object - Options of the ldap client according to "ldapjs"
 *                           }
 */
var ldapClientHelper = function(options)
{
    this.options = options || null;
    this.client  = undefined;
}

/**
 * Connect to the configured LDAP server.
 *
 * @param {Function} callback - Function to call when finished
 */
ldapClientHelper.prototype.connect = function(callback)
{
    var connectionInfo = this.options.ldap.bindDN.green.bold + ' @ ' + this.options.ldap.url.green.bold;
    this.client        = require('ldapjs').createClient(this.options.ldap);

    this.client.bind(this.options.ldap.bindDN, this.options.ldap.bindCredentials, function(err) {

        if (err) {

            logger.error('LDAP server connection failed for ' + connectionInfo);
            callback && callback(err);
            return;
        }

        logger.info('LDAP server connection suceeded for ' + connectionInfo);
        callback && callback(null);
        return;
    });
}

/**
 * Close the connection.
 *
 * @param {Function} callback - Function to call when finished
 */
ldapClientHelper.prototype.close = function(callback)
{
    if (this.client) {

        this.client.unbind(callback);
        return;
    }

    callback && callback();
}

/**
 * Search on the LDAP server.
 *
 * @param {String} base - Search DN
 * @param {Object} options - Options for the search according to "ldapjs"
 * @param {Function} callback - Function to call when finished
 */
ldapClientHelper.prototype.search = function(base, options, callback)
{
    if (! this.client) {

        callback && callback('LDAP server connection not established');
        return;
    }

    this.client.search(base, options, function(err, res) {

        if (err) {

            callback && callback(err);
            return;
        }

        var results = [];

        res.on('error', function(err) {

            logger.error('LDAP request failed. Details: ' + JSON.stringify(err));
            callback && callback(err);
        });

        res.on('searchEntry', function(entry) {
            results.push(entry);
        });

        res.on('end', function(result) {
            callback && callback(null, results);
        });
    });
}

/**
 * Strip results to their attributes.
 *
 * @param {Array} results - Results array
 * @return {Array}
 */
ldapClientHelper.prototype.resultsToJSON = function(results)
{
    var stripped = [];

    results.forEach(function(result) {

        if (! result.attributes) {
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

module.exports = ldapClientHelper;

