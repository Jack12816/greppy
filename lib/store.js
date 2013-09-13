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
}

/**
 * Return the value of a given key and its given namespace.
 *
 * @param {String} [namespace] - Namespace or the default-namespace
 * @param {String} key - Key to get
 * @return {Mixed}
 */
Store.prototype.get = function()
{
    if (2 == arguments.length) {

        var namespace = arguments[0];
        var key       = arguments[1];
    }

    if (1 == arguments.length) {

        var namespace = 'default';
        var key       = arguments[0];
    }

    if (!namespace || !key) {
        throw new Error('Arguments are not correctly set');
        return;
    }

    return (this.namespaces[namespace] && this.namespaces[namespace][key]) || null;
}

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
    if (3 == arguments.length) {

        var namespace = arguments[0];
        var key       = arguments[1];
        var value     = arguments[2];
    }

    if (2 == arguments.length) {

        var namespace = 'default';
        var key       = arguments[0];
        var value     = arguments[1];
    }

    if (!namespace || !key) {
        throw new Error('Arguments are not correctly set');
        return;
    }

    if (!this.namespaces[namespace]) {
        throw new Error('Namespace "' + namespace + '" was not registered');
        return;
    }

    this.namespaces[namespace][key] = value;
}

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
        return;
    }

    return Object.keys(this.namespaces[namespace]);
}

module.exports = Store;

