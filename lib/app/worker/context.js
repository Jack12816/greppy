/**
 * Application Worker Context
 *
 * @module greppy/app/worker/context
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var path = require('path');

/**
 * @constructor
 *
 * @param {String} childFilename - Path of the child which extends this class
 */
var Context = function(childFilename)
{
    this.name        = path.basename(childFilename, '.js');
    this.description = '';
    this.backends    = {};
    this.modules     = [];
    this.controllers = {};
    this.routes      = [];
};

/**
 * Worker context pre configure method.
 *
 * @param {Object} app - The application object
 * @param {Object} server - Server object
 * @param {Function} callback - Function to call on finish
 */
Context.prototype.preConfigure = function(app, server, callback)
{
    callback && callback();
};

/**
 * Worker context configure method.
 *
 * @param {Object} app - The application object
 * @param {Object} server - Server object
 * @param {Function} callback - Function to call on finish
 */
Context.prototype.configure = function(app, server, callback)
{
    callback && callback();
};

/**
 * Worker context post configure method.
 *
 * @param {Object} app - The application object
 * @param {Object} server - Server object
 * @param {Function} callback - Function to call on finish
 */
Context.prototype.postConfigure = function(app, server, callback)
{
    callback && callback();
};

module.exports = Context;

