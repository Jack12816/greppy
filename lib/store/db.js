/**
 * Database-Connections Store
 *
 * @module greppy/store/db
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util       = require('util');
var async      = require('async');
var Connection = require('../db/connection');

/**
 * @constructor
 */
var DBStore = function(config)
{
    this.store  = {};
    this.config = config;
};

/**
 * Configure all selected backends and/or connections.
 *
 * @param {Object} select - Selection of backends and connections
 * @param {Function} callback - Function to call on finish
 */
DBStore.prototype.configure = function(select, callback)
{
    if (null === select) {
        return callback && callback();
    }

    var self             = this;
    var backendsSelected = Object.keys(select);
    var map              = {};

    // If we got no selection - use all backends with all connections
    if (0 === backendsSelected.length) {

        Object.keys(this.config).forEach(function(backend) {

            // Setup backends map
            if (!map.hasOwnProperty(backend)) {
                map[backend] = [];
            }

            // Map all connections for the current backend
            Object.keys(self.config[backend]).forEach(function(connection) {

                map[backend].push({
                    name       : connection,
                    backend    : backend,
                    connection : new Connection(
                        connection,
                        backend,
                        self.config[backend][connection]
                    )
                });
            });
        });

    } else {

        // Walk throuh all selected backends
        backendsSelected.forEach(function(backend) {

            // We got backends selected, proof their config existence
            if (!self.config.hasOwnProperty(backend)) {
                throw new Error('Requested backend "' + backend + '" is not configured.');
            }

            // Setup backends map
            if (!map.hasOwnProperty(backend)) {
                map[backend] = [];
            }

            var backendConnections = Object.keys(select[backend]).length;
            var connections        = [];

            // Map all connections for the current backend
            Object.keys(self.config[backend]).forEach(function(connection) {

                connections.push({
                    name       : connection,
                    backend    : backend,
                    connection : new Connection(
                        connection,
                        backend,
                        self.config[backend][connection]
                    )
                });
            });

            // We got no specific connections selection - use all
            if (0 === backendConnections) {
                map[backend] = connections;
                return;
            }

            // Iterate over all selected connections of the current backend
            select[backend].forEach(function(connection) {

                if (!self.config[backend].hasOwnProperty(connection)) {
                    throw new Error(
                        'Requested backend "' + backend +
                        '" has no configured "' + connection + '" connection'
                    );
                }

                map[backend].push({
                    name       : connection,
                    backend    : backend,
                    connection : new Connection(
                        connection,
                        backend,
                        self.config[backend][connection]
                    )
                });
            });
        });
    }

    // Prepare connections for async configure
    var connections = [];

    Object.keys(map).forEach(function(backend) {
        connections = connections.concat(map[backend]);
    });

    if (0 === connections.length) {
        callback && callback();
        return;
    }

    // Configure all connections for all backends parallel
    async.each(connections, function(connection, callback) {

        // Write the connection to the DB Store
        if (!self.store[connection.backend]) {
            self.store[connection.backend] = {};
        }

        self.store[connection.backend][connection.name] = connection.connection;

        // Configure connection
        connection.connection.configure(callback);

    }, function(err) {

        if (err) {
            callback && callback(err);
            return;
        }

        logger.info('All ' + 'backend connections'.yellow + ' established');
        callback && callback();
    });
};

/**
 * Close all connections for this store.
 *
 * @param {Function} callback - Function to call on finish
 */
DBStore.prototype.close = function(callback)
{
    var self = this;
    var connections = [];

    Object.keys(this.store).forEach(function(backend) {

        Object.keys(self.store[backend]).forEach(function(connection) {

            connections.push(self.store[backend][connection]);
        });
    });

    async.each(connections, function(connection, callback) {

        connection.close(callback);

    }, function(err) {

        if (err) {
            callback && callback(err);
            return;
        }

        callback && callback();
    });
};

/**
 * Get a connection by namepath from the store.
 *
 * @param {String} namepath - The namepath to search the backend/connection for
 * @return {Object}
 */
DBStore.prototype.get = function(namepath)
{
    if (!namepath) {
        throw new Error('Namepath was not given');
    }

    namepath       = namepath.split('.');
    var backend    = namepath.shift();
    var connection = namepath.join('.');

    if (!backend || !connection) {
        throw new Error('Namepath "' + namepath + '" is faulty');
    }

    if (!this.store.hasOwnProperty(backend)) {
        throw new Error('Backend "' + backend + '" is not registered');
    }

    if (!this.store[backend].hasOwnProperty(connection)) {

        throw new Error(
            'Backend "' + backend + '" got no connection "' +
            connection + '" registered'
        );
    }

    return this.store[backend][connection];
};

module.exports = DBStore;

