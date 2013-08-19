/**
 * MySQL Database Backend Adapter
 *
 * @module greppy/db/adapter/mysql
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var async    = require('async');
var prettify = require('pretty-data').pd;

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
 * @return void
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

            logger.info(
                'MySQL connection'.red
                + ' (' + self.name.green.bold + ')'
                + ' is established to '
                + self.config.host
                + ':'
                + self.config.port
            );

            // The connection can be closed immediately
            connection.end(function() {
                callback && callback(undefined, self.pool);
            });
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
                            + prettify.sql(msg).yellow
                        );
                    }
                }
            );

        } catch(e) {

            callback && callback(e);
            return;
        }

        // Load all models which match to the current connection from all modules
        var modulePath = process.cwd() + '/modules/';

        fs.readdirSync(modulePath).forEach(function(module) {

            var moduleModelsPath = modulePath + module + '/models/' + self.name + '/';

            // Skip orm-less modules
            if (!fs.existsSync(moduleModelsPath)) {
                return;
            }

            var associations = false;

            // Import all models and add them to the model map
            fs.readdirSync(moduleModelsPath).forEach(function(file) {

                // Skip dot-files
                if (!file.match(/\.js$/)) {
                    return;
                }

                // If we find a associations map, mark it to load afterwards
                if (-1 !== file.indexOf('Associations.js')) {
                    associations = true;
                    return;
                }

                self.orm.models[file.replace(/\.js/gi, '')] = self.orm.instance.import(
                    moduleModelsPath + '/' + file
                );
            });

            if (associations) {

                require(moduleModelsPath + '/Associations.js')(
                    self.orm.instance,
                    self.orm.models
                );
            }
        });

        callback && callback(undefined, self.orm);
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

            callback && callback(undefined, results[0], results[1]);
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

    callback && callback('Neither "plain" nor "orm" was selected.');
}

/**
 * Prepare a connection to auto reconnect on close events.
 *
 * @param {Object} connection - Connection to prepare
 * @return void
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
 * @return void
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

        this.pool.end(callback);
        return;
    }

    // The ORM only
    if (this.config.orm) {

        this.orm.instance.connectorManager.disconnect();
        callback && callback();
        return;
    }
}

module.exports = MySQL;

