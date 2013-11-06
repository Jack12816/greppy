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
 * Worker context configure method.
 */
Context.prototype.configure = function(app, server, callback)
{
    callback && callback();
};

module.exports = Context;

