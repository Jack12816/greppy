/**
 * Middleware - Default
 *
 * @module greppy/app/worker/middleware/default
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var express = require('express');

/**
 * @constructor
 */
var DefaultMiddleware = function()
{
};

/**
 * Append the default middleware to the given application stack.
 *
 * @param {Object} app - Application to configure
 * @param {function} callback - Function to call on finish
 */
DefaultMiddleware.prototype.configure = function(app, callback)
{
    // Always use the body parser
    // The body parser will be removed with connect 3.0
    app.use(express.json());
    app.use(express.urlencoded());

    callback && callback();
};

module.exports = DefaultMiddleware;

