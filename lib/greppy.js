/**
 * Framework Loader
 *
 * @module greppy/loader
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs      = require('fs');
var cluster = require('cluster');
var colors  = require('colors');

/**
 * @constructor
 */
var Greppy = function()
{
    // First of all, load the data-types extensions
    var extensionPath = __dirname + '/extension/datatype/';
    fs.readdirSync(extensionPath).forEach(function(extension) {

        if (!extension.match(/\.js$/i)) {
            return;
        }

        require(extensionPath + extension);
    });

    // Register all sub-super globals
    this.cluster = cluster;
    this.config  = new (this.get('store.config'))();
    this.helper  = new (this.get('store.helper'))();
    this.db      = new (this.get('store.db'))();

    // Annotate this as the super global "greppy"
    global.greppy = this;
};

/**
 * Return a class definition.
 *
 * @param {String} classPath - Dot seperated class path
 * @return {Function}
 */
Greppy.prototype.get = function(classPath)
{
    var path = __dirname + '/' + classPath.split('.').join('/');

    try {
        return require(path);
    } catch(e) {
        console.log(e.stack);
        throw new Error('Cannot load class "' + classPath + '" (' + path + ').');
    }
}

module.exports = new Greppy();

