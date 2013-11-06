/**
 * Configuration Store
 *
 * @module greppy/store/config
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util   = require('util');
var fs     = require('fs');
var Store  = require('../store');
var Config = require('../config');

/**
 * @constructor
 */
var ConfigStore = function()
{
    ConfigStore.super_.call(this);

    // Try to load the application config if exists
    if (fs.existsSync(process.cwd() + '/app/config/application.js')) {
        this.load(process.cwd() + '/app/config/application.js', 'app');
    }
};

/**
 * Extend Greppy generic store
 */
util.inherits(ConfigStore, Store);

/**
 * Load a configuration from a given path
 * and push it into the store.
 *
 * @param {String} path - Path to the config to load
 * @param {String} key - Key to use for later addressing
 * @param {Object} [options] - Options to pass to the config
 */
ConfigStore.prototype.load = function(path, key, options)
{
    if (!path) {
        throw new Error('Path was not given');
    }

    if (!key) {
        throw new Error('Key was not given');
    }

    options = options || {};
    options.path = path;

    var config = new Config(options);
    this.set(key, config);

    return config;
};

/**
 * Create a new configuration and push it into the store.
 *
 * @param {String} key - Key to use for later addressing
 * @param {Object} [options] - Options to pass to the config
 */
ConfigStore.prototype.new = function(key, options)
{
    if (!key) {
        throw new Error('Key was not given');
    }

    options = options || {};

    var config = new Config(options);
    this.set(key, config);

    return config;
};

module.exports = ConfigStore;

