/**
 * MySQL Database Backend Adapter
 *
 * @module greppy/db/adapter/mysql
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs               = require('fs');
var async            = require('async');
var util             = require('util');
var prettify         = require('pretty-data').pd;
var managementHelper = {};

/**
 * @constructor
 *
 * @param {String} name - Name of the connection
 * @param {Object} config - Config of the connection
 */
var MySQL = function(name, config)
{
    var self    = this;
    this.config = config;
    this.name   = name;

    this.pool = undefined;
    this.orm  = {
        instance : undefined,
        models   : {}
    };
}

/**
 * Establish the connection and do some configurations for it.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.configure = function(callback)
{
    var self  = this;

    /**
     * Setup the plain MySQL connection, pooling enabled
     */
    var setupPlain = function(callback)
    {
        self.pool = (require('mysql')).createPool({
            user     : self.config.username,
            password : self.config.password,
            database : self.config.db,
            host     : self.config.host,
            port     : self.config.port
        });

        // Initiate a connection - just to proof configuration
        self.pool.getConnection(function(err, connection) {

            if (err || !connection) {
                callback && callback(err);
                return;
            }

            self.prepare(connection);

            // The connection can be closed immediately
            connection.release();
            return callback && callback(null, self.pool);
        });
    };

    /**
     * Setup the ORM
     */
    var setupOrm = function(callback)
    {
        try {

            self.orm.instance = new (require('sequelize'))(
                self.config.db,
                self.config.username,
                self.config.password,
                {
                    host: self.config.host,
                    port: self.config.port,
                    define: {
                        freezeTableName   : false,
                        syncOnAssociation : true,
                        charset           : 'utf8',
                        collate           : 'utf8_general_ci',
                        timestamps        : true
                    },
                    sync: { force: true },
                    syncOnAssociation: true,
                    pool: { maxConnections: 5, maxIdleTime: 30 },
                    define: {
                        paranoid    : false,
                        underscored : false,
                        charset     : 'utf8',
                        collate     : 'utf8_general_ci'
                    },
                    logging: function(msg) {
                        msg = msg.replace(/^executing: /i, '');
                        logger.debug(
                            'MySQL ' + self.name.green.bold + ' executing:\n'
                            + prettify.sql(msg).yellow + '\n'
                        );
                    }
                }
            );

            self.orm.utils = (require('sequelize')).Utils;

        } catch(e) {

            callback && callback(e);
            return;
        }

        // List all models for all modules
        var modules = (new (require('../../helper/project'))()).listModelsForAllModules(
            process.cwd(), true
        );

        var connectionName = 'mysql.' + self.name;
        var associations   = [];

        Object.keys(modules).forEach(function(module) {

            // Skip modules which got no models for this connection
            if (!modules[module].hasOwnProperty(connectionName)) {
                return;
            }

            modules[module][connectionName].forEach(function(model) {

                var path = process.cwd() + '/modules/'
                            + module + '/models/' + connectionName + '/' + model;

                if ('Associations' === model) {
                    return associations.push(path);
                }

                // Import the current model and add it to the model map
                self.orm.models[model] = self.orm.instance.import(path);
            });
        });

        // Load all found associations
        associations.forEach(function(path) {
            require(path)(self.orm.instance, self.orm.models);
        });

        callback && callback(null, self.orm);
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
 * Prepare a connection to auto reconnect on close events.
 *
 * @param {Object} connection - Connection to prepare
 */
MySQL.prototype.prepare = function(connection)
{
    if (!connection || connection.listeners('error').length > 0) {
        return;
    }

    var self = this;

    connection.on('error', function(err) {

        if (!err.fatal) {
            return;
        }

        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }

        logger.info(
            'MySQL connection'.red
            + ' (' + self.name.green.bold + ') is reconnected on '
            + connection.config.host
            + ":"
            + connection.config.port
            + " (Message: "
            + err.message
            + ")"
        );

        self.pool.getConnection(function(err, connection) {
            self.prepare(connection);
        });
    });
}

/**
 * Close the connection(s) which where established.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.close = function(callback)
{
    var self = this;

    // We need to configure both
    if (this.config.plain && this.config.orm) {

        this.pool.end(function() {

            self.orm.instance.connectorManager.disconnect();
            callback && callback();
        });

        return;
    }

    // The plain connection only
    if (this.config.plain) {
        return this.pool.end(callback);
    }

    // The ORM only
    if (this.config.orm) {

        this.orm.instance.connectorManager.disconnect();
        return callback && callback();
    }
}

/**
 * Management method - will create the database for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.create = function(callback)
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
            return callback && callback(err);
        }

        self.orm.instance.query(
            'CREATE DATABASE IF NOT EXISTS '
            + dbName
            + ' CHARACTER SET utf8 COLLATE utf8_general_ci;'
        ).success(function() {
            self.close(callback);
        }).error(function(err) {
            self.close(callback);
        });
    });
}

/**
 * Management method - will drop the database for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.drop = function(callback)
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
            return callback && callback(err);
        }

        self.orm.instance.query(
            'DROP DATABASE IF EXISTS '
            + dbName
            + ';'
        ).success(function() {
            self.close(callback);
        }).error(function(err) {
            self.close(callback);
        });
    });
}

/**
 * Management method - will run all migrations for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.migrate = function(callback)
{
    var self          = this;
    this.config.orm   = true;
    this.config.plain = false;

    // Bootstrap the connection
    this.configure.call(this, function(err) {

        if (err) {
            return callback && callback(err);
        }

        var migationsPath = process.cwd() + '/database/migrations/mysql.' + self.name + '/';

        // No migrations found for the current connection
        if (!(require('fs').existsSync(migationsPath))) {
            return self.close(callback);
        }

        global.fs     = require('fs');
        global.async  = require('async');
        global.greppy = require('../../greppy');
        global.orm    = self.orm.instance;
        global.models = self.orm.models;

        var migrator = self.orm.instance.getMigrator({
            path: migationsPath
        });

        migrator.migrate().success(function() {
            self.close(callback);
        }).error(function(err) {
            self.close(function() {
                callback && callback(err);
            });
        });
    });
}

/**
 * Management method - will run all migrations for the configured
 * connection.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.fill = function(callback)
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
            process.cwd(), 'mysql.' + self.name
        );

        // No fixtures found for the current connection
        if ('undefined' === typeof fixtures.fixtures || 0 === fixtures.fixtures.length) {
            return self.close(callback);
        }

        global.fs     = require('fs');
        global.async  = require('async');
        global.greppy = require('../../greppy');
        var share     = {};
        var utils     = (require('sequelize')).Utils;
        utils.content = greppy.helper.get('db.fixture');

        async.eachSeries(fixtures.fixtures, function(file, callback) {

            console.log(
                '\033[0;34mExecuting fixture: '
                + file + '\033[0m\n'
            );

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
}

/**
 * Management method - will clear all data from all tables.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.clear = function(callback)
{
    var runOnAllTables = managementHelper.runOnAllTables.bind(
        this, 'TRUNCATE %s', callback
    )();
}

/**
 * Management method - will remove all tables.
 *
 * @param {Function} callback - Function to call on finish
 */
MySQL.prototype.purge = function(callback)
{
    this.orm.models.SequelizeMeta = {
        tableName: 'SequelizeMeta'
    };

    var runOnAllTables = managementHelper.runOnAllTables.bind(
        this, 'DROP TABLE IF EXISTS %s', callback
    )();
}

/**
 * Management helper method - will run a command on all tables.
 *
 * @param {String} command - Command to run
 * @param {Function} callback - Function to call on finish
 */
managementHelper.runOnAllTables = function(command, callback)
{
    var self          = this;
    this.config.orm   = true;
    this.config.plain = false;

    // Bootstrap the connection
    this.configure.call(this, function(err, db, orm) {

        if (err) {
            return callback && callback(err);
        }

        async.eachSeries(Object.keys(orm.models), function(model, callback) {

            console.log(model);

            model = orm.models[model];

            orm.instance.query(util.format(command, model.tableName)).success(function() {
                callback && callback();
            }).error(function(err) {
                callback && callback(err);
            });

        }, function(err) {

            return self.close(function() {
                callback && callback(err);
            });
        });
    });
}

module.exports = MySQL;

