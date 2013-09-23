/**
 * HTTP Authentication Handler
 *
 * @module greppy/auth/handler/http
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var express = require('express');

/**
 * @constructor
 * @param {Object} options - Options of the HTTP authentication handler
 */
var HttpAuthHandler = function(options)
{
    // Call the super constructor
    HttpAuthHandler.super_.apply(this, arguments);
};

/**
 * Extend Greppy framework base authentication handler
 */
util.inherits(HttpAuthHandler, require('./base'));

/**
 * Do some preparation before the authentication and set
 * the headers of the HTTP auth popup.
 *
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} next - Function to call when finished
 * @return void
 */
HttpAuthHandler.prototype.middleware = function(req, res, next)
{
    var self = this;

    express.basicAuth(function(username, password, callback) {
        HttpAuthHandler.super_.prototype.process.call(self, username, password, req, callback);
    }).apply(this, arguments);
}

module.exports = HttpAuthHandler;

