/**
 * Helper-Sets Store
 *
 * @module greppy/store/helper
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util  = require('util');
var Store = require('../store');
var path  = require('path');
var fs    = require('fs');

/**
 * @constructor
 */
var HelperStore = function()
{
    HelperStore.super_.call(this);

    var self       = this;
    var pathHelper = new (require('../helper/path'))();

    // Load default framework helpers
    var defaultHelperPath = path.normalize(__dirname + '/../helper');
    pathHelper.list(defaultHelperPath).forEach(function(helperPath) {

        if (!helperPath.match(/\.js$/i)) {
            return;
        }

        self.loadHelper(self.pathToName(helperPath, defaultHelperPath), helperPath);
    });

    // Load all modules from the application
    var defaultModulePath = process.cwd() + '/modules/';
    fs.readdirSync(defaultModulePath).forEach(function(module) {

        if (!fs.statSync(defaultModulePath + module).isDirectory()) {
            return;
        }

        self.loadModule(module);
    });
}

/**
 * Extend Greppy generic store
 */
util.inherits(HelperStore, Store);

/**
 * Convert the path to the valid helper-keys format.
 *
 * @param {String} path - Absolute path to the helper file
 * @param {String} helperPath - Cutting prefix on absolute paths
 * @param {String} [module] - Module name to prefix
 * @return {String}
 */
HelperStore.prototype.pathToName = function(path, helperPath, module)
{
    if (!path) {
        throw new Error('Module was not given');
        return;
    }

    if (!helperPath) {
        throw new Error('Helper path was not given');
        return;
    }

    var name = (module) ? (module + '.') : '';

    return name += path.replace(helperPath, '')
                       .replace(/\//ig, '.')
                       .replace(/^\./ig, '')
                       .replace(/\.js$/i, '');
}

/**
 * Load all helpers for a given module.
 *
 * @param {String} module - Name of the module
 * @return void
 */
HelperStore.prototype.loadModule = function(module)
{
    if (!module) {
        throw new Error('Module was not given');
        return;
    }

    var self       = this;
    var modulePath = process.cwd() + '/modules/' + module + '/helpers/';

    if (!fs.existsSync(modulePath)) {
        return;
    }

    this.get('path').list(modulePath).forEach(function(helperPath) {

        if (!helperPath.match(/\.js$/i)) {
            return;
        }

        self.loadHelper(self.pathToName(helperPath, modulePath), helperPath);
    });
}

/**
 * Load an helper as given key and load the file.
 *
 * @param {String} key - Helper name (namespace/key)
 * @param {String} path - Absolute path to the helper file
 * @return void
 */
HelperStore.prototype.loadHelper = function(key, path)
{
    this.set(key, new (require(path))());
}

module.exports = HelperStore;

