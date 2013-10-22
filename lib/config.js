/**
 * Configuration
 *
 * @module greppy/config
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var extend = require('extend');
var fs     = require('fs');

/**
 * @constructor
 *
 * @param {Object} options - Options of the config
 */
var Config = function(options)
{
    if ('undefined' === typeof options) {
        throw new Error('No options defined');
    }

    this.path    = options.path || null;
    this.default = options.default || {};
    this.values  = options.values || {};

    if (options.default && options.values) {
        this.merge(options.values);
    }

    if (this.path) {
        this.load();
    }
};

/**
 * Load a configuration from a given path.
 *
 * @param {String} [path] - Path to the config to load
 */
Config.prototype.load = function(path)
{
    if (!path && !this.path) {
        throw new Error('No path was given or set');
    }

    path = path || this.path;

    if (!fs.existsSync(path)) {
        throw new Error('Path "' + path + '" does not exists');
    }

    if (!fs.statSync(path).isFile()) {
        throw new Error('Path "' + path + '" is not a file');
    }

    try {

        var extension = require('path').extname(path);
        var values    = {};

        if ('.json' === extension || '.js' === extension) {
            values = require(path);
        }

        this.set(values);

    } catch (e) {
        console.log(e);
        throw new Error('Failed to parse and load the config file');
    }
};

/**
 * Get config|config-key.
 *
 * @param {String} [key] - Key to get or without an key get the whole config
 */
Config.prototype.get = function(key)
{
    if (!key) {
        return this.values;
    }

    return this.values[key] || null;
};

/**
 * Set config|config-key by given value.
 *
 * @param {String} [key] - Key to set or without an key overwrite the whole config
 * @param {Mixed} value - Value to set
 */
Config.prototype.set = function(key, value)
{
    if (1 === arguments.length) {

        value = arguments[0];
        key   = null;
    }

    if ('undefined' === typeof value) {
        throw new Error('Value was not specified');
    }

    if (!key) {

        // If we got a default config, merge the new over it
        if (this.default) {
            this.merge(value);
            return;
        }

        this.values = value;
        return;
    }

    this.values[key] = value;
};

/**
 * Set the default configuration.
 *
 * @param {Object} config - Config to set as default
 */
Config.prototype.setDefault = function(config)
{
    if (!config) {
        throw new Error('Default config was not specified');
    }

    this.default = config;
};

/**
 * Get the predefined default configuration.
 *
 * @return {Object}
 */
Config.prototype.getDefault = function()
{
    return this.default;
};

/**
 * Merge in a new config over the predefined default config.
 *
 * @param {Object} config - Config to merge in
 * @param {Boolean} [deep] - Perform a deep merge
 */
Config.prototype.merge = function(config, deep)
{
    deep = ('undefined' === typeof deep) ? true : deep;
    this.values = extend(deep, {}, this.default, config);
};

module.exports = Config;

