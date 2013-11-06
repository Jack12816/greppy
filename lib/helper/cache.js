/**
 * Cache Helper
 *
 * @module greppy/helper/cache
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var CacheHelper = function()
{
};

/**
 * Build an cache key by given arguments.
 *
 * @param {Object} args - Method arguments to build an key of
 * @return {String}
 */
CacheHelper.prototype.key = function(args)
{
    var key            = '';
    var argsValues     = [];
    var firstIsRequest = false;

    // The first parameter of args could be an request
    // Search it for request meta-data
    if ('object' === typeof args[0] && args[0].hasOwnProperty('url')) {
        key += args[0].url + ':';
        firstIsRequest = true;
    }

    // Search the request for service meta-data
    if (firstIsRequest && args[0].hasOwnProperty('service')) {

        if (args[0].service.name) {
            key += args[idx].service.name + ':';
        }

        if (args[0].service.method) {
            key += args[idx].service.method + ':';
        }
    }

    // Build of all given arguments an cache key
    Object.keys(args).forEach(function(idx) {

        // Skip the first parameter if it is a request object
        if (0 === idx && firstIsRequest) {
            return;
        }

        // Skip functions for key hashing
        if ('function' === typeof args[idx]) {
            return;
        }

        // Stringify founded objects
        if ('object' === typeof args[idx]) {
            return argsValues.push(JSON.stringify(args[idx]));
        }

        // Simply add scalar values
        argsValues.push(args[idx]);
    });

    // Build key from matched key arguments
    return argsValues.join(':');
};

module.exports = CacheHelper;

