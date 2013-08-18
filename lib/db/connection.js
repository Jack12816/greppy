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
    this.name     = name;
    this.config   = config;

    try {

        this.backend = new (require('./adapter/' + backend))(name, config);

    } catch (e) {

        throw new Error('Backend adapter "' + backend + '" does not exist.');
        return;
    }
}

/**
 * Confígure the connection.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
Connection.prototype.configure = function(callback)
{
    var self = this;

    this.backend.configure(function(err, instance, orm) {

        self.errors   = err;
        self.instance = instance,
        self.orm      = orm;

        callback && callback(err);
    });
}

/**
 * Close the connection.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
Connection.prototype.close = function(callback)
{
    this.backend.close(callback);
}

/**
 * Get the ORM specific objects (ORM and models array).
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
Connection.prototype.getORM = function(callback)
{
    if (!this.config.orm) {
        throw new Error('ORM was not configured for the "' + this.name + '" connection');
        return;
    }

    callback && callback(this.orm.instance, this.orm.models);
}

module.exports = Connection;

