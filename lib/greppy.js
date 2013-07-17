/**
 * Framework Loader
 *
 * @module greppy/loader
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var greppy = {};

/**
 * Return a class definition.
 *
 * @param {String} classPath - Dot seperated class path
 * @return {Function}
 */
greppy.get = function(classPath)
{
    var path = __dirname + '/' + classPath.split('.').join('/');

    try {
        return require(path);
    } catch(e) {
        throw new Error('Cannot load class "' + classPath + '".');
    }
}

module.exports = greppy;

