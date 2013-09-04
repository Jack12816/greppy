/**
 * Basic HTTP Authentication Handler
 *
 * @module greppy/auth/handler/http.basic
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 * @param {Object} options - Options of the base authentication handler
 */
var BasicAuthHandler = function(options)
{
    // Call the super constructor
    BasicAuthHandler.super_.call(this);

    this.options = options || {};
};

/**
 * Extend Greppy framework base auth handler
 */
util.inherits(BasicAuthHandler, require('../base'));

module.exports = BasicAuthHandler;

