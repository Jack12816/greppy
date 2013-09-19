/**
 * MongoDB Database Backend Adapter
 *
 * @module greppy/db/adapter/mongodb
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs               = require('fs');
var async            = require('async');
var managementHelper = {};

/**
 * @constructor
 *
 * @param {String} name - Name of the connection
 * @param {Object} config - Config of the connection
 */
var MongoDB = function(name, config)
{
    this.mongo = require('mongodb');

    this.config = config;
    this.name   = name;

    this.connection = undefined;
    this.orm  = {
        instance : undefined,
        models   : {}
    };
}

/**
 * Establish the connection and do some configurations for it.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
MongoDB.prototype.configure = function(callback)
{
    var self  = this;

    /**
     * Setup the plain MongoDB connection
     */
    var setupPlain = function(callback)
    {
        var mongo      = require('mongodb');
        var connection = null;

        // Build an replicSet if more than one server was configured
        if (1 < self.config.servers.length) {

            var servers = [];

            self.config.servers.forEach(function(server) {

                servers.push(new mongo.Server(
                    server.host,
                    server.port,
                    {auto_reconnect: true}
                ));
            });

            connection = new mongo.ReplSet(servers);

        // We got just one server, so we dont need to
        // build an replicSet
        } else if (1 === self.config.servers.length) {

            var server = self.config.servers.shift();

            connection = new mongo.Server(
                server.host,
                server.port,
                {auto_reconnect: true}
            );

        // No servers were given, this is fatal,
        // so callback an error
        } else {

            return callback && callback(new Error(
                'No server was specified.'
            ));
        }

        // Setup the mongodb client
        self.connection = new mongo.MongoClient(connection, self.config.options || {});

        // Connect to the mongodb connection
        self.connection.open(function(err, connection) {

            if (err) {
                return callback && callback(err);
            }

            // Rewrite connection
            self.connection = connection;

            // Setup connection to the configured database
            var db = self.connection.db(self.config.db)

            if (self.config.username && self.config.password) {

                return db.authenticate(self.config.username, self.config.password, function(err, result) {

                    if (err) {
                        return callback && callback(err);
                    }

                    callback && callback(null, db);
                });
            }

            callback && callback(null, db);
        });
    };

    /**
     * Setup the ORM
     */
    var setupOrm = function(callback)
    {
        callback && callback(null, {});
    };

    // Prepare default config values
    this.config.plain = ('undefined' === typeof this.config.plain) ? true : this.config.plain;
    this.config.orm   = ('undefined' === typeof this.config.orm) ? true : this.config.orm;

    // We need to configure both
    if (this.config.plain && this.config.orm) {

        async.map([setupPlain, setupOrm], function(method, callback) {

            method(callback);

        }, function(err, results) {

            if (err) {
                callback && callback(err);
                return;
            }

            callback && callback(null, results[0], results[1]);
        });

        return;
    }

    // The plain connection only
    if (this.config.plain) {

        setupPlain(function(err, instance) {
            callback && callback(err, instance);
        });
        return;
    }

    // The ORM only
    if (this.config.orm) {

        setupOrm(function(err, orm) {
            callback && callback(err, undefined, orm);
        });
        return;
    }

    callback && callback('Neither "plain" nor "orm" were selected.');
}

/**
 * Close the connection(s) which where established.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
MongoDB.prototype.close = function(callback)
{
    var self = this;

    // We need to configure both
    if (this.config.plain && this.config.orm) {
        return this.connection.close(callback);
    }

    // The plain connection only
    if (this.config.plain) {
        return this.connection.close(callback);
    }

    // The ORM only
    if (this.config.orm) {
        return callback && callback();
    }
}

/**
 * Management method - will create the database for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
MongoDB.prototype.create = function(callback)
{
    var self          = this;
    var dbName        = this.config.db;
    this.config.orm   = true;
    this.config.plain = false;

    // If we specify no db name we connect global
    this.config.db = '';

    // Bootstrap the connection
    this.configure.call(this, function(err) {

        // Rewrite db name to the configuration
        self.config.db = dbName;

        if (err) {
            callback && callback(err);
            return;
        }

        // Do the creation of the database
        callback && callback();
    });
}

/**
 * Management method - will drop the database for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
MongoDB.prototype.drop = function(callback)
{
    var self          = this;
    var dbName        = this.config.db;
    this.config.orm   = true;
    this.config.plain = false;

    // If we specify no db name we connect global
    this.config.db    = '';

    // Bootstrap the connection
    this.configure.call(this, function(err) {

        // Rewrite db name to the configuration
        self.config.db = dbName;

        if (err) {
            callback && callback(err);
            return;
        }

        // Do the deletion of the database
        callback && callback();
    });
}

/**
 * Management method - will run all migrations for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
MongoDB.prototype.migrate = function(callback)
{
    var self          = this;
    this.config.orm   = true;
    this.config.plain = false;

    // Bootstrap the connection
    this.configure.call(this, function(err) {

        if (err) {
            callback && callback(err);
            return;
        }

        // Do the migration of documents
        callback && callback();
    });
}

/**
 * Management method - will run all migrations for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
MongoDB.prototype.fill = function(callback)
{
    var self          = this;
    this.config.orm   = true;
    this.config.plain = false;

    // Bootstrap the connection
    this.configure.call(this, function(err) {

        if (err) {
            callback && callback(err);
            return;
        }

        // Do the filling of the database
        callback && callback();
    });
}

module.exports = MongoDB;

