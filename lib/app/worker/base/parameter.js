/**
 * Base Application - Parameters
 *
 * @module greppy/app/worker/base/parameters
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var Parameters = function()
{
};

/**
 * Populate the given application with parameters.
 *
 * @param {Object} app - Application to configure
 * @param {function} callback - Function to call on finish
 */
Parameters.prototype.configure = function(app, callback)
{
    // Simple parameter regex validator
    app.param(function(name, fn) {

        if (fn instanceof RegExp) {

            return function(req, res, next, val) {

                var captures;

                if (captures = fn.exec(String(val))) {

                    if (1 === captures.length) {
                        req.params[name] = captures[0];
                    } else {
                        req.params[name] = captures;
                    }

                    next();

                } else {
                    next('route');
                }
            };
        }
    });

    // Default param mappings

    // Id validator for simple primary keys
    app.param('id', /^\d+$/);

    // ObjectId validator for MongoDB object ids
    app.param('oid', /^[0-9a-f]{24}$/i);

    // Generic UUID validator - matches version 1 to 5
    app.param('uuid', /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i);

    // Semver 2.0.0 validator for version numbers
    app.param('version', /^v?((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/);

    callback && callback();
};

module.exports = Parameters;

