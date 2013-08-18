/**
 * Route Helper
 *
 * @module greppy/helper/view/route
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var Route = function()
{
}

/**
 * Match the current route.
 *
 * @param {String} currentPath - Current path to compare
 * @param {String} path - Path to match with current route
 * @param {String} classes - Classes string to return on match
 * @return {String}
 */
Route.prototype.current = function(currentPath, path, classes)
{
    if (currentPath === path) {
        return classes;
    }

    return '';
}

module.exports = Route;

