# Authentication

Greppy provides adapters and handlers for authentication.

An adapter is a simple component that only performes authentication against a
datasource and returns the result. The adapter is like an interface to a
datasource and the datasource acts like a whitelist.

Such an adapter can additionaly be stuck into a handler, giving the opportunity
to do some processing around the authentication and to perform operations on
error or success. The handler is like an interface to the data input.

## Adapters

### Array

#### Create an adapter

    var options = {
        users : [
            {
                username : 'greppler',
                password : 'secret'
            },
            {
                username : 'another_greppler',
                password : 'much_more_secret'
            }
        ]
    };
    var arrayAuthAdapter = new (greppy.get('auth.adapter.array'))(options);

* {Object} options - Options of the array authentication adapter
    * {Array} users - Whitelist of users
        * {String} username - Loginname of a user
        * {String} password - Password of a user

#### Authenticate a user

    arrayAuthAdapter.authentication(user, credentials, function(err, isAuthenticated) {
        if (err) {
            console.log(err);
        } else {
            console.log(isAuthenticated);
        }
    });

* {String} user - Username
* {String} credentials - Password
* {Object} err - Error, set if one occured
* {Boolean} isAuthenticated - Has the user been authenticated?

### htpasswd

#### Create an adapter

    var options = {
        file : 'path/to/.htpasswd'
    };
    var htpasswdAuthAdapter = new (greppy.get('auth.adapter.htpasswd'))(options);

* {Object} options - Options of the htpasswd authentication adapter
    * {String} file - path to the .htpasswd file (generated with htpasswd)

#### Authenticate a user

    htpasswdAuthAdapter.authentication(user, credentials, function(err, isAuthenticated) {
        if (err) {
            console.log(err);
        } else {
            console.log(isAuthenticated);
        }
    });

* {String} user - Username
* {String} credentials - Password
* {Object} err - Error, set if one occured
* {Boolean} isAuthenticated - Has the user been authenticated?

### LDAP

#### Create an adapter

    var options = {
        ldap: {
            url        : 'ldaps://ldap.acme.net',
            tlsOptions : {
                rejectUnauthorized: false
            },
            userBindDN : 'uid={{{username}}},ou=Users,dc=acme,dc=net'
        }
    };
    var ldapAuthAdapter = new (greppy.get('auth.adapter.ldap'))(options);

* {Object} options - Options of the LDAP authentication adapter
    * {Object} ldap - Options of the LDAP client
        * {String} userBindDN - The DN all user connections should be bound as,
use the placeholder {{{username}}}
        * {Mixed} other Parameters - Various options of the LDAP client
according to [ldapjs](http://ldapjs.org/client.html)

#### Authenticate a user

    ldapAuthAdapter.authentication(user, credentials, function(err, isAuthenticated) {
        if (err) {
            console.log(err);
        } else {
            console.log(isAuthenticated);
        }
    });

* {String} user - Username
* {String} credentials - Password
* {Object} err - Error, set if one occured
* {Boolean} isAuthenticated - Has the user been authenticated?

### Define own adapters

The definition of own authentication adapters is very easy. Just create a class
and implement the "authentication(user, credentials, callback)" method.
Everything else is up to you.

** Sekeleton: **

    /**
     * Sekeleton Authentication Adapter
     *
     * This authentication adapter authenticates users ... .
     *
     * @module greppy/auth/adapter/skeleton
     * @author Ralf Grawunder <r.grawunder@googlemail.com>
     */

    /**
     * @constructor
     * @param {Object} options - Options of the skeleton authentication adapter
     */
    var SekeletonAuthAdapter = function(options)
    {
        this.options = options || null;
    };

    /**
     * Authenticate a user with his credentials ... .
     *
     * @param {Mixed} user - Representation of the user
     * @param {Mixed} credentials - Representation of the credentials
     * @param {Function} callback - Function to call when finished
     * @return void
     */
    SekeletonAuthAdapter.prototype.authentication = function(user, credentials, callback)
    {
        var err             = undefined;
        var isAuthenticated = true;

        callback && callback(err, isAuthenticated);
    };

    module.exports = SekeletonAuthAdapter;

## Handlers

### Base

#### Create a handler

    var options = {
        adapter : customAuthAdapter,
        success : function() {
            console.log('--- SUCCESS ---');
        },
        error   : function() {
            console.log('--- ERROR ---');
        }
    };
    var baseAuthHandler = new (greppy.get('auth.handler.base'))(options);

* {Object} options - Options of the base authentication handler
    * {Object | Array} adapter - Reference to the authentication adapter(s) to
be used
    * {Function} success - Optional: Operation to perform when the
authentication has succeeded
    * {Function} error - Optional: Operation to perform when the authentication
has failed

#### Authenticate a user

    baseAuthHandler.middleware(req, res, function(err, isAuthenticated) {
        if (err) {
            console.log(err);
        } else {
            console.log(isAuthenticated);
        }
    });

* {Object} req - The Request
* {Object} res - The Response
* {Object} err - Error, set if one occured
* {Boolean} isAuthenticated - Has the user been authenticated?

### Define own handlers

The definition of own authentication handlers is very easy, too. Specialised
authentication must inherit the base handler and overwrite the
"middleware(req, res, callback)" and "post(isAuthenticated, callback)" methods.
Everything else is up to you.

** Sekeleton: **

    /**
     * Skeleton Authentication Handler
     *
     * @module greppy/auth/handler/skeleton
     * @author Ralf Grawunder <r.grawunder@googlemail.com>
     */

    /**
     * @constructor
     * @param {Object} options - Options of the skeleton authentication handler
     */
    var SkeletonAuthHandler = function(options)
    {
        // Call the super constructor
        SkeletonAuthHandler.super_.apply(this, arguments);
    };

    /**
     * Extend Greppy framework base authentication handler
     */
    util.inherits(SkeletonAuthHandler, greppy.get('auth.handlers.base'));

    /**
     * Do some preparation before the authentication and fetch the
     * representations of the user and credentials according to the
     * authentication adapter(s).
     *
     * @param {Object} req - The Request
     * @param {Object} res - The Response
     * @param {Function} next - Function to call when finished
     * @return void
     */
    SkeletonAuthHandler.prototype.middleware = function(req, res, next)
    {
        var user        = req.body.user || '';
        var credentials = req.body.credentials || '';
        SkeletonAuthHandler.super_.prototype.process.call(self, user, credentials, next);
    }

    /**
     * Do some postprocessing after the authentication.
     *
     * @param {Boolean} isAuthenticated - AHas the user been authenticated?
     * @param {Function} callback - Function to call when finished
     * @return void
     */
    SkeletonAuthHandler.prototype.post = function(isAuthenticated, callback)
    {
        console.log(isAuthenticated);
        callback && callback();
    }

    module.exports = SkeletonAuthHandler;


