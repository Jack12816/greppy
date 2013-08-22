/**
 * LDAP Authentication Adapter
 *
 * This authentication adapter authenticates users against a LDAP server.
 *
 * @module greppy/auth/adapters/ldap
 * @author Ralf Grawunder <r.grawunder@googlemail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the LDAP authentication adapter
 */
var LdapAuthAdapter = function(options)
{
    this.options = options || null;
};

/**
 * Authenticate a user with his credentials against a LDAP server.
 *
 * @param {String} user - username
 * @param {String} credentials - password
 * @param {Function} callback - Function to call when finished
 * @return void
 */
LdapAuthAdapter.prototype.authentication = function(user, credentials, callback)
{
    var self                          = this;
    self.options.ldap.bindDN          = require('mustache').render(self.options.ldap.userBindDN, { username : user });
    self.options.ldap.bindCredentials = credentials;
    var connectionInfo                = self.options.ldap.bindDN.green.bold.green.bold + ' @ ' + self.options.ldap.url.green.bold;

    var ldapClientHelper = new (greppy.get('helper.ldap.client'))({ ldap : self.options.ldap });

    ldapClientHelper.connect(function(err) {

        if (err) {

            logger.warn('LdapAuthAdapter authentification failed for ' + connectionInfo);
            callback && callback(err, false);
            return;
        }

        ldapClientHelper.close();
        logger.info('LdapAuthAdapter authentification succeeded for ' + connectionInfo);
        callback && callback(undefined, true);
        return;
    });
};

module.exports = LdapAuthAdapter;

