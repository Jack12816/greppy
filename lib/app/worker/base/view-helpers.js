/**
 * Base Application - View Helpers
 *
 * @module greppy/app/worker/base/view-helpers
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var ViewHelpers = function()
{
};

/**
 * Populate the given application with view helpers.
 *
 * @param {Object} app - Application to configure
 * @param {function} callback - Function to call on finish
 */
ViewHelpers.prototype.configure = function(app, callback)
{
    // Push view helpers to the application
    app.locals.helper = {};

    greppy.helper.list().forEach(function(helper) {

        if (-1 === helper.indexOf('view')) {
            return;
        }

        path = helper.split('.');
        path.splice(path.indexOf('view'), 1);

        var buildPath = function(base, props, value) {

            var prop = props.shift();

            if (!prop) {
                return;
            }

            if (0 === props.length) {
                base[prop] = value;
                return;
            }

            if (!base.hasOwnProperty(prop)) {
                base[prop] = {};
            }

            buildPath(base[prop], props, value);
        };

        buildPath(app.locals.helper, path, greppy.helper.get(helper));
    });

    callback && callback();
};

module.exports = ViewHelpers;

