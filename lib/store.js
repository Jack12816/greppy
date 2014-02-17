/**
 * Generic Key-Value, Namespace-based Store
 *
 * @module greppy/store
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util = require('util');

/**
 * @constructor
 *
 * @param {Array} namespaces - Namespaces to register
 */
var Store = function(namespaces)
{
    var self        = this;
    this.namespaces = {
        default: {}
    };

    if (namespaces && util.isArray(namespaces)) {

        namespaces.forEach(function(namespace) {
            self.namespaces[namespace] = {};
        });
    }
};

/**
 * Return the value of a given key and its given namespace.
 *
 * @param {String} [namespace] - Namespace or the default-namespace
 * @param {String} key - Key to get
 * @return {Mixed}
 */
Store.prototype.get = function()
{
    var self      = this;
    var namespace = null;
    var key       = null;

    if (2 == arguments.length) {

        namespace = arguments[0];
        key       = arguments[1];
    }

    if (1 == arguments.length) {

        namespace = 'default';
        key       = arguments[0];
    }

    if (!namespace || !key) {
        throw new Error('Arguments are not correctly set');
    }

    var lastCharPos = key.length -1;

    // Check for an wildcard get request
    if ('*' === key[lastCharPos]) {

        var searchKey = key.substr(0, lastCharPos);
        var map = {};

        var found = this.list(namespace).filter(function(name) {
            return name.startsWith(searchKey);
        });

        if (0 === found.length) {
            return null;
        }

        found.forEach(function(name) {

            var nameStripped = (0 === lastCharPos)
                ? name
                : name.substr(lastCharPos, name.length - 1);

            map[nameStripped] = self.get(name);
        });

        return map;
    }

    return (this.namespaces[namespace] && this.namespaces[namespace][key]) || null;
};

/**
 * Set the value of a given key and its given namespace.
 *
 * @param {String} [namespace] - Namespace or the default-namespace
 * @param {String} key - Key to write to
 * @param {String} value - Value to set upon the key
 * @return {Mixed}
 */
Store.prototype.set = function()
{
    var namespace = null;
    var key       = null;
    var value     = null;

    if (3 == arguments.length) {

        namespace = arguments[0];
        key       = arguments[1];
        value     = arguments[2];
    }

    if (2 == arguments.length) {

        namespace = 'default';
        key       = arguments[0];
        value     = arguments[1];
    }

    if (!namespace || !key) {
        throw new Error('Arguments are not correctly set');
    }

    if (!this.namespaces[namespace]) {
        throw new Error('Namespace "' + namespace + '" was not registered');
    }

    this.namespaces[namespace][key] = value;
};

/**
 * List all keys in a given namespace.
 *
 * @param {String} [namespace] - Namespace or the default-namespace
 * @return {Array}
 */
Store.prototype.list = function(namespace)
{
    namespace = namespace || 'default';

    if (!this.namespaces[namespace]) {
        throw new Error('Namespace "' + namespace + '" was not registered');
    }

    return Object.keys(this.namespaces[namespace]);
};

module.exports = Store;

