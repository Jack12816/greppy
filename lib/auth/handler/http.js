/**
 * Basic HTTP Authentication Handler
 *
 * @module greppy/auth/handler/http.basic
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var express = require('express');

/**
 * @constructor
 * @param {Object} options - Options of the base authentication handler
 */
var BasicAuthHandler = function(options)
{
    // Call the super constructor
    BasicAuthHandler.super_.apply(this, arguments);
};

/**
 * Extend Greppy framework base auth handler
 */
util.inherits(BasicAuthHandler, require('./base'));

/**
 * Do some preparation before the authentication and set
 * the headers of the HTTP auth popup.
 *
 * @param {Object} req - The Request
 * @param {Object} res - The Response
 * @param {Function} next - Function to call when finished
 * @return void
 */
BasicAuthHandler.prototype.middleware = function(req, res, next)
{
    var self = this;

    express.basicAuth(function(username, password, callback) {
        BasicAuthHandler.super_.prototype.process.call(self, username, password, callback);
    }).apply(this, arguments);
}

module.exports = BasicAuthHandler;

