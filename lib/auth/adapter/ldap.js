/**
 * LDAP Authentication Adapter
 *
 * This authentication adapter authenticates users against a LDAP server.
 *
 * @module greppy/auth/adapter/ldap
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the LDAP authentication adapter
 */
var LdapAuthAdapter = function(options)
{
    this.name    = 'ldap';
    this.options = options || {};
};

/**
 * Authenticate a user with his credentials against a LDAP server.
 *
 * @param {String} user - username
 * @param {String} credentials - password
 * @param {Function} callback - Function to call when finished
 */
LdapAuthAdapter.prototype.authentication = function(user, credentials, callback)
{
    var self = this;

    // Prepare the credentials mapping for ldapjs
    self.options.ldap.bindCredentials = credentials;

    // Prepare the configured userBindDN
    self.options.ldap.bindDN = require('mustache').render(
        self.options.ldap.userBindDN,
        {username: user}
    );

    var connectionInfo = self.options.ldap.bindDN.green.bold
                         + ' @ ' + self.options.ldap.url.green.bold;

    // Setup the LDAP client
    var ldapClientHelper = new (greppy.get('helper.ldap.client'))({
        ldap : self.options.ldap
    });

    ldapClientHelper.connect(function(err) {

        if (err) {
            return callback && callback(err, false);
        }

        ldapClientHelper.close();
        return callback && callback(null, true);
    });
};

module.exports = LdapAuthAdapter;

