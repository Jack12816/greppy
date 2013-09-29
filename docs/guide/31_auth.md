# Authentication

Greppy provides an authentication system, which is based on adapters and
handlers. The authentication process is splitted into two parts, where the
input (eg. username and password), which comes from the user, will be handled
by authentication handlers and the datasource on which this inputs will be
verified by one or many adapters.

## Adapters

An adapter is a simple component that just performs authentication against a
datasource and returns the result. The adapter is like an interface to a
datasource and the datasource acts like a whitelist.
Such an adapter can additionaly be stuck into a handler, giving the opportunity
to do some processing around the authentication and to perform operations on
error or success.

### Array

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

### htpasswd

    var options = {
        file : 'path/to/htpasswd'
    };

    var htpasswdAuthAdapter = new (greppy.get('auth.adapter.htpasswd'))(options);

* {Object} options - Options of the htpasswd authentication adapter
    * {String} file - path to the .htpasswd file (generated with htpasswd)

### LDAP

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
        * {String} userBindDN - The DN all user connections should be bound as, use the placeholder {{{username}}}
        * {Mixed} other Parameters - Various options of the LDAP client according to [ldapjs](http://ldapjs.org/client.html)

### Define own adapters

The definition of own authentication adapters is very easy. Just create a class
and implement the ``authentication(user, credentials, callback)`` method.
Everything else is up to you.

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

The handler provides an interface to the data input.

### HTTP

    var httpAuth = new (greppy.get('auth.handler.http'))({
        adapter: [htpasswdSource, arraySource],
        success: function() {
            // The user inputs were verified against the adapters
            // and are proven to be valid
        },
        error: function() {
            // The user inputs couldn't be verified or
            // the inputs are not valid on any adapter
        }
    });

* {Object} options - Options of the base authentication handler
    * {Object | Array} adapter - Reference to the authentication adapter(s) to be used
    * {Function} success - Optional: Operation to perform when the authentication has succeeded
    * {Function} error - Optional: Operation to perform when the authentication has failed

### Define own handlers

The definition of own authentication handlers is very easy, too. Specialized
authentication must inherit the base handler and overwrite the
``middleware(req, res, callback)`` and can overwrite the ``post(isAuthenticated, callback)``
methods. Everything else is up to you.

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
        // Do some mapping, cleaning and preparations like:
        var user        = req.body.user || '';
        var credentials = req.body.credentials || '';

        // Call the base handler authentication processing method
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
        // Do some post processing

        callback && callback();
    }

    module.exports = SkeletonAuthHandler;

## Examples

An usefull example for the Greppy authentication system is the usage on
controllers which you want to protect against unauthenticated access. So you
can setup an authentication handler with adapter for every controller you
want to protect, but it's more clever to define all these configurations
on the context configuration. So you would write something like this inside
the ``configure()`` method of your context:

    Context.prototype.configure = function(app, server, callback)
    {
        // Define some Auth stuff
        var httpAuth = new (greppy.get('auth.handler.http'))({
            adapter: [
                new (greppy.get('auth.adapter.array'))({
                    users: [
                        {username: 'admin', password: 'admin'}
                    ]
                }),
                new (greppy.get('auth.adapter.htpasswd'))({
                    file: __dirname + '/../config/htpasswd'
                })
            ]
        });

        app.set('auth.http', httpAuth);

        // ...
    }

So the ``auth.http`` setting of the application can be accessed by
the controller specific ``configure()`` method like this:

    Controller.prototype.configure = function(app, server, callback)
    {
        this.options.auth.handler = app.get('auth.http');
        this.options.auth.routes  = [];

        callback && callback();
    };

You can manage the protection very fine-grained to every route of the
controller by an array of regular expressions. If this array is empty
all routes of the controller will be protected by the given handler.
If you set ``options.auth.routes`` to ``null``, no route of the
controller will be protected.

