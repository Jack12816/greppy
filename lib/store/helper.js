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
};

/**
 * Extend Greppy generic store
 */
util.inherits(HelperStore, Store);

/**
 * Load all helpers of the application.
 */
HelperStore.prototype.loadApplicationHelpers = function()
{
    var self = this;

    // Load all modules from the application
    var defaultModulePath = process.cwd() + '/modules/';

    // Skip loading of application helpers on environments
    // which does not provides a modules directory
    if (!fs.existsSync(defaultModulePath)) {
        return;
    }

    fs.readdirSync(defaultModulePath).forEach(function(module) {

        if (!fs.statSync(defaultModulePath + module).isDirectory()) {
            return;
        }

        self.loadModule(module);
    });
};

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
    }

    if (!helperPath) {
        throw new Error('Helper path was not given');
    }

    var name = (module) ? (module + '.') : '';

    return name += path.replace(helperPath, '')
                       .replace(/\//ig, '.')
                       .replace(/^\./ig, '')
                       .replace(/\.js$/i, '');
};

/**
 * Load all helpers for a given module.
 *
 * @param {String} module - Name of the module
 */
HelperStore.prototype.loadModule = function(module)
{
    if (!module) {
        throw new Error('Module was not given');
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

        self.loadHelper(self.pathToName(helperPath, modulePath, module), helperPath);
    });
};

/**
 * Load an helper as given key and load the file.
 *
 * @param {String} key - Helper name (namespace/key)
 * @param {String} path - Absolute path to the helper file
 */
HelperStore.prototype.loadHelper = function(key, path)
{
    var helper = (require(path));

    if ('function' === typeof helper) {

        try {
            return this.set(key, new helper());
        } catch (e) {
            console.log('Could not load the helper: ' + path, helper);
            console.log(e.stack);
            throw new Error('Error occured while loading an helper.');
        }
    }

    if ('object' === typeof helper) {
        return this.set(key, helper);
    }

    console.log('Could not load the helper: ' + path, helper);
    throw new Error('Helper is not of supported type.');
};

/**
 * Wrapper for the original store method.
 *
 * @param {String} [namespace] - Namespace or the default-namespace
 * @param {String} key - Key to get
 * @return {Mixed}
 */
HelperStore.prototype.get = function()
{
    var helper = HelperStore.super_.prototype.get.apply(this, arguments);

    if (null === helper) {

        throw new Error(
            'Helper "' + arguments[0] + '" is not registered.' +
            ' The folling helpers are registered:\n * ' +
            this.list().join('\n * ')
        );
    }

    return helper;
};

module.exports = HelperStore;

