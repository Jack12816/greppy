/**
 * The plain-loader is responsible for loading test-files
 * without special settings
 * 
 * @module greppy/helper/test/loader
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var PlainLoader = function()
{
};

/**
 * Creates a simple object for each passed test path.
 * 
 * @param {String} path
 * @returns {Object}
 */
PlainLoader.prototype.getTest = function(path)
{
    return {
        file    : path,
        command : 'test'
    };
};

module.exports = PlainLoader;
