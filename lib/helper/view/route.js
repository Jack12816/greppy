/**
 * RouteHelper Helper
 *
 * @module greppy/helper/view/route
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var RouteHelper = function()
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
RouteHelper.prototype.current = function(currentPath, path, classes)
{
    if ('string' === typeof path && currentPath === path) {
        return classes;
    }

    if (path instanceof RegExp && path.test(currentPath)) {
        return classes;
    }

    return '';
}

module.exports = RouteHelper;

