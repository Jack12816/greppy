/**
 * Application Configuration
 *
 * @module greppy/app/config
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var extend  = require('extend');

/**
 * @constructor
 *
 * @param {Object} content - Content of the config
 * @param {String} path - Path of the config
 */
var Config = function(content, path)
{
    this.content = content;
    this.path    = path;
}

/**
 * Return a section from the config.
 *
 * @param {String} section - Section of the application config
 * @return {Mixed}
 */
Config.prototype.get = function(section)
{
    if (this.content.hasOwnProperty(section)) {
        return this.content[section];
    }

    throw new Error('Config section "' + section + '" was not found.');
}

/**
 * Return a merged section from the config with an given default-config.
 *
 * @param {String} section - Section of the application config
 * @param {Object} defaults - Default object to merge config with
 * @param {Boolean} [deep] - Merge deep
 * @return {Mixed}
 */
Config.prototype.merge = function(section, defaults, deep)
{
    deep = ('undefined' == typeof deep) ? true : deep;
    return extend(true, defaults, this.get(section));
}

/**
 * @constructor
 *
 * @param {String} [path] - Path to look for
 */
var ConfigLoader = function(path)
{
    this.path = path || process.cwd() + '/app/config/';
    this.configs = {};
}

/**
 * Load a given config to cache.
 *
 * @param {String} file - Filename of the config
 * @param {String} [path] - Path to look for
 * @return {Mixed}
 */
ConfigLoader.prototype.load = function(file, path)
{

}

