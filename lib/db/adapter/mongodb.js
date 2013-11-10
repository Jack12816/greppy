/**
 * MongoDB Database Backend Adapter
 *
 * @module greppy/db/adapter/mongodb
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs               = require('fs');
var async            = require('async');
var extend           = require('extend');
var managementHelper = {};

/**
 * @constructor
 *
 * @param {String} name - Name of the connection
 * @param {Object} config - Config of the connection
 */
var MongoDB = function(name, config)
{
    this.mongo    = require('mongodb');
    this.mongoose = require('mongoose');

    this.config = config;
    this.name   = name;

    this.connection = undefined;
    this.orm        = {
        instance : undefined,
        models   : {}
    };
};

/**
 * Establish the connection and do some configurations for it.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.configure = function(callback)
{
    var self = this;

    if (!this.config.uri) {
        return callback && callback(new Error(
            'No URI is configured.'
        ));
    }

     var defaultOpts = {
        db: {
            native_parser: true
        },
        server: {
            auto_reconnect: true
        }
    };

    // Merge client options with defaults
    extend(true, defaultOpts, self.config.options || {});

    /**
     * Setup the plain MongoDB connection
     */
    var setupPlain = function(callback)
    {
        // Connect to the given URI with the given options
        self.mongo.MongoClient.connect(self.config.uri, defaultOpts, function(err, db) {

            if (err) {
                return callback && callback(err);
            }

            // Rewrite connection
            self.connection = db;

            callback && callback(null, db);
        });
    };

    /**
     * Setup the ORM
     */
    var setupOrm = function(callback)
    {
        // Connect to the given URI with the given options
        self.mongoose.connect(self.config.uri, defaultOpts, function(err) {

            if (err) {
                return callback && callback(err);
            }

            // List all models for all modules
            var modules = (new (require('../../helper/project'))()).listModelsForAllModules(
                process.cwd(), false
            );

            var connectionName = 'mongodb.' + self.name;
            Schema = self.mongoose.Schema;

            Object.keys(modules).forEach(function(module) {

                // Skip modules which got no models for this connection
                if (!modules[module].hasOwnProperty(connectionName)) {
                    return;
                }

                modules[module][connectionName].forEach(function(model) {

                    var path = process.cwd() + '/modules/' +
                               module + '/models/' + connectionName + '/' + model;

                    // Import the current schema to compile a model out of it
                    try {
                        self.mongoose.connection.model(model, require(path));
                    } catch (e) {
                        logger.error(
                            'Failed to load model ' + model.bold.green +
                            ' of ' + connectionName.yellow
                        );
                        return callback && callback(e);
                    }
                });
            });

            // Clear global variable pollution
            delete Schema;

            // Rewrite ORM connection and models
            self.orm.instance = self.mongoose.connection;
            self.orm.models   = self.mongoose.connection.models;

            callback && callback(null, self.orm);
        });

        self.mongoose.connection.on('error', function(err) {
            logger.error('Error occured on ' + self.name.yellow + ' backend. Details: ' + (err.stack || err));
        });
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
        return setupPlain(callback);
    }

    // The ORM only
    if (this.config.orm) {

        setupOrm(function(err, orm) {
            callback && callback(err, undefined, orm);
        });
        return;
    }

    callback && callback('Neither "plain" nor "orm" were selected.');
};

/**
 * Close the connection(s) which where established.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.close = function(callback)
{
    var self = this;

    // We need to configure both
    if (this.config.plain && this.config.orm) {
        return this.connection.close(function() {
            self.mongoose.disconnect(callback);
        });
    }

    // The plain connection only
    if (this.config.plain) {
        return this.connection.close(callback);
    }

    // The ORM only
    if (this.config.orm) {
        return this.mongoose.disconnect(callback);
    }
};

/**
 * Management method - will create the database for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.create = function(callback)
{
    var self          = this;
    this.config.orm   = false;
    this.config.plain = true;

    // Bootstrap the connection
    this.configure.call(this, function(err, db) {

        if (err) {
            return callback && callback(err);
        }

        // Do the creation of the database
        db.createCollection('__setup', function(err, collection) {

            if (err) {
                self.close();
                return callback && callback(err);
            }

            collection.drop(function(err) {

                if (err) {
                    return self.close(function() {
                        callback && callback(err);
                    });
                }

                self.close(callback);
            });
        });
    });
};

/**
 * Management method - will drop the database for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.drop = function(callback)
{
    var self          = this;
    this.config.orm   = false;
    this.config.plain = true;

    // Bootstrap the connection
    this.configure.call(this, function(err, db) {

        if (err) {
            return callback && callback(err);
        }

        // Do the deletion of the database
        db.dropDatabase(function(err) {

            if (err) {
                return self.close(function() {
                    callback && callback(err);
                });
            }

            self.close(callback);
        });
    });
};

/**
 * Management method - will run all migrations for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.migrate = function(callback)
{
    var self          = this;
    this.config.orm   = true;
    this.config.plain = true;

    // Bootstrap the connection
    this.configure.call(this, function(err, db, orm) {

        if (err) {
            return callback && callback(err);
        }

        async.each(Object.keys(orm.models), function(model, callback) {

            model = orm.models[model];
            logger.info('Create ' + model.collection.name.yellow + ' collection\n');
            model.ensureIndexes(callback);

        }, function(err) {

            if (err) {
                return self.close(function() {
                    callback && callback(err);
                });
            }

            var migrations = (new (require('../../helper/project'))()).listMigrationsForConnection(
                process.cwd(), 'mongodb.' + self.name
            );

            // No migrations found for the current connection
            if ('undefined' === typeof migrations.migrations || 0 === migrations.migrations.length) {
                return self.close(callback);
            }

            global.fs     = require('fs');
            global.async  = require('async');
            global.greppy = require('../../greppy');

            async.eachSeries(migrations.migrations, function(file, callback) {

                console.log(
                    '\033[0;34mExecuting migration: ' + file + '\033[0m\n'
                );

                var migration = require(migrations.path + file);

                if (!migration.hasOwnProperty('up') || 'function' !== typeof migration.up) {

                    return callback && callback(new Error(
                        'Migration got no up() method or is no function'
                    ));
                }

                migration.up(db, orm, function(err) {

                    if (err) {
                        console.log(err);
                    }

                    callback && callback(err);
                });

            }, function(err) {
                 return self.close(function() {
                    callback && callback(err);
                });
            });
        });
    });
};

/**
 * Management method - will run all migrations for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.fill = function(callback)
{
    var self          = this;
    this.config.orm   = true;
    this.config.plain = false;

    // Bootstrap the connection
    this.configure.call(this, function(err) {

        if (err) {
            return callback && callback(err);
        }

        var fixtures = (new (require('../../helper/project'))()).listFixturesForConnection(
            process.cwd(), 'mongodb.' + self.name
        );

        // No fixtures found for the current connection
        if ('undefined' === typeof fixtures.fixtures || 0 === fixtures.fixtures.length) {
            return self.close(callback);
        }

        global.fs     = require('fs');
        global.async  = require('async');
        global.greppy = require('../../greppy');
        var share     = {};
        var utils     = require('mongoose/lib/utils');
        utils.content = greppy.helper.get('db.fixture');

        async.eachSeries(fixtures.fixtures, function(file, callback) {

            console.log('\033[0;34mExecuting fixture: ' + file + '\033[0m\n');

            require(fixtures.path + file)(
                self.orm.instance, self.orm.models, share, utils, function(err) {

                    if (err) {
                        console.log(err);
                    }

                    callback && callback(err);
                }
            );

        }, function(err) {
            return self.close(function() {
                callback && callback(err);
            });
        });
    });
};

/**
 * Management method - will clear all data from all collections.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.clear = function(callback)
{
    var self = this;

    var runOnAllTables = managementHelper.runOnAllCollections.bind(
        this, function(collection, callback) {

            console.log(
                '\033[0;34mClear collection ' + collection.collectionName + '\033[0m\n'
            );

            collection.remove({}, {fsync: true}, function(err) {

                if (err) {
                    return self.close(function() {
                        callback && callback(err);
                    });
                }

                callback && callback();
            });

        }, callback
    )();
};

/**
 * Management method - will remove all collections.
 *
 * @param {Function} callback - Function to call on finish
 */
MongoDB.prototype.purge = function(callback)
{
    var self = this;

    var runOnAllTables = managementHelper.runOnAllCollections.bind(
        this, function(collection, callback) {

            console.log(
                '\033[0;34mRemove collection ' + collection.collectionName + '\033[0m\n'
            );

            collection.drop(function(err) {

                if (err) {
                    return self.close(function() {
                        callback && callback(err);
                    });
                }

                callback && callback();
            });

        }, callback
    )();
};

/**
 * Management helper method - will run a command on all collections.
 *
 * @param {Function} iterator - Function to run on each collection
 * @param {Function} callback - Function to call on finish
 */
managementHelper.runOnAllCollections = function(iterator, callback)
{
    var self          = this;
    this.config.orm   = false;
    this.config.plain = true;

    // Bootstrap the connection
    this.configure.call(this, function(err, db) {

        if (err) {
            return callback && callback(err);
        }

        db.collections(function(err, collections) {

            if (err) {
                return self.close(function() {
                    callback && callback(err);
                });
            }

            async.each(collections, function(collection, callback) {

                if (err) {
                    return self.close(function() {
                        callback && callback(err);
                    });
                }

                if (/^system./i.test(collection.collectionName)) {
                    return callback && callback();
                }

                iterator(collection, callback);

            }, function(err) {

                return self.close(function() {
                    callback && callback(err);
                });
            });
        });
    });
};

module.exports = MongoDB;

