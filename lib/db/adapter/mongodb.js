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
    };

    /**
     * Setup the ORM
     */
    var setupOrm = function(callback)
    {
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
        return callback && callback();;
    }

    // The plain connection only
    if (this.config.plain) {
        return callback && callback();;
    }

    // The ORM only
    if (this.config.orm) {
        return callback && callback();;
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
    });
}

module.exports = MongoDB;

