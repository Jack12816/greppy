/**
 * Framework Loader
 *
 * @module greppy/loader
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs      = require('fs');
var cluster = require('cluster');
var colors  = require('colors');
var winston = require('winston');
var moment  = require('moment');
var es5     = require('es5-shim');
var es6     = require('es6-shim');

/**
 * @constructor
 */
var Greppy = function()
{
    // Annotate this as the super global "greppy"
    global.greppy = this;

    // Set environment if not given
    greppy.env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    // Setup the default logger
    this.initDefaultLogger();

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

    // Load all helpers of the application
    this.helper.loadApplicationHelpers();
};

/**
 * Setup an default logger. This is adds the ability to
 * easily use the Greppy Framework parts without an Greppy
 * application.
 */
Greppy.prototype.initDefaultLogger = function()
{
    this.logger = new winston.Logger({
        transports: [
            new (winston.transports.Console)({
                colorize  : true,
                timestamp : function() {
                    return moment().format().yellow.bold;
                },
                level  : 'debug',
                silent : false
            })
        ]
    });

    greppy.logger = global.logger = this.logger;
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
};

module.exports = new Greppy();

