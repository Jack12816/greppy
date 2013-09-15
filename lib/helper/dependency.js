/**
 * Dependency Helper
 *
 * @module greppy/helper/dependency
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

/**
 * @constructor
 */
var Dependency = function() {
    this.modules = {};
    this.paths   = {};
};

/**
 * Allows to get a dependency.
 * 
 * @param {String} type Maybe 'module' or 'path'
 * @param {String} key Which path or module to get
 * @returns {Mixed}
 */
Dependency.prototype.get = function(type, key) {
    type = this.validateType(type);
    
    return this[type + 's'][key] || null;
};

/**
 * Allows to set a dependency.
 * 
 * @param {String} type Maybe 'module' or 'path'
 * @param {String} key Which path or module to set
 * @param {Mixed} val Value for the specified key
 * @returns {undefined}
 */
Dependency.prototype.set = function(type, key, val) {
    type = this.validateType(type);
    
    this[type + 's'][key] = val;
};

/**
 * Checks, if a correct type string was provided.
 * 
 * @param {String} type
 * @returns {String|Bool}
 */
Dependency.prototype.validateType = function(type) {
    type = type.toLowerCase();
    
    if ('module' !== type || 'path' !== type) {
        throw new Error('Invalid dependency type passed!');
    }
    
    return type;
};

module.exports = Dependency;
