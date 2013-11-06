/**
 * Database Connection
 *
 * @module greppy/db/connection
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 *
 * @param {String} name - Name of the connection
 * @param {String} backend - Name of the backend
 * @param {Object} config - Backend configuration
 */
var Connection = function(name, backend, config)
{
    this.errors   = null;
    this.instance = null;
    this.orm      = {
        instance : undefined,
        models   : {}
    };
    this.name        = name;
    this.backendName = backend;
    this.config      = config;

    try {

        this.backend = new (require('./adapter/' + backend))(name, config);

    } catch (e) {
        throw new Error('Backend adapter "' + backend + '" does not exist.');
    }
};

/**
 * Confígure the connection.
 *
 * @param {Function} callback - Function to call on finish
 */
Connection.prototype.configure = function(callback)
{
    var self = this;

    this.backend.configure(function(err, instance, orm) {

        self.errors   = err;
        self.instance = instance,
        self.orm      = orm;

        if (err) {

            if ('string' !== typeof err) {

                if (err instanceof Error) {
                    err = '\n' + err.message;
                } else {
                    err = '\n' + JSON.stringify(err, null, '  ');
                }
            }

            logger.error(
                'Failed to configure ' + self.backendName.yellow + '.' +
                self.name.red + '. Details:' + err
            );

            return callback && callback(err);
        }

        logger.info(
            'Connection' + ' (' + (self.backendName + '.' +
            self.name).green.bold + ')' + ' is established'
        );

        callback && callback();
    });
};

/**
 * Close the connection.
 *
 * @param {Function} callback - Function to call on finish
 */
Connection.prototype.close = function(callback)
{
    this.backend.close(callback);
};

/**
 * Get the ORM specific objects (ORM and models array).
 *
 * @param {Function} callback - Function to call on finish
 */
Connection.prototype.getORM = function(callback)
{
    if (!this.config.orm) {
        throw new Error('ORM was not configured for the "' + this.name + '" connection');
    }

    callback && callback(this.orm.instance, this.orm.models, this.orm.utils || null);
};

module.exports = Connection;

