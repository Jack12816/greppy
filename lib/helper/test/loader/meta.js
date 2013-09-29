/**
 * The meta-loader is responsible for loading tests with special settings.
 * Other tests are processed by the specified next-object.
 * 
 * @module greppy/helper/test/loader
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

/**
 * @constructor
 * @param {Array} metas The meta informations of the tests to process
 */
var MetaLoader = function(metas)
{
    this.conditionsMet = [];
    this.metas         = metas;
    this.next          = null;
};

/**
 * Sets the next object for the chain of responsibility.
 * 
 * @param {Object} next The next object in the chain.
 * @returns {undefined}
 */
MetaLoader.prototype.setNext = function(next)
{
    if ('object' !== typeof next) {
        throw new Error('Please pass a valid instance as next-object!');
    }
    this.next = next;
};

/**
 * Tell the loader that specified conditions are met.
 * 
 * @param {Array} conditions An array of strings representing the conditions which are met.
 * @returns {undefined}
 */
MetaLoader.prototype.setConditionsMet = function(conditions)
{
    this.conditionsMet = conditions;
};

/**
 * Returns an object with the following keys:
 * command: May be 'test' or 'skip'.
 * file: The filepath of the test.
 * 
 * @param {String} path The path of the test.
 * @returns {Object}
 */
MetaLoader.prototype.getTest = function(path)
{   
    
    // first, check if we can process the path
    if (this.getMetaByPath(path)) {
        return this.toTest(path);
    }

    return this.next && this.next.getTest(path);
};

/**
 * Creates a test object from the corresponding meta.
 * 
 * @param {String} path The path of the test.
 * @returns {Object}
 */
MetaLoader.prototype.toTest = function(path)
{
    var meta = this.getMetaByPath(path);
    var retObj = {
        file: path,
        command: this.hasAllRequirements(meta.conditions) ? 'test' : 'skip'
    };

    if ('number' === typeof meta.order) {
        retObj.order = meta.order;
    }

    return retObj;
};

/**
 * Returns the meta object for the given path or null if no
 * corresponding meta object was found.
 * 
 * @param {String} path
 * @returns {Object}
 */
MetaLoader.prototype.getMetaByPath = function(path)
{
    var i = 0;

    for (/* omitted */; i < this.metas.length; i++) {

        if (this.metas[i].file === path) {
            return this.metas[i];
        }
    }

    return null;
};

/**
 * Determines if the current instance has all passed terms enabled.
 * 
 * @param {Array} reqs
 * @returns {Bool}
 */
MetaLoader.prototype.hasAllRequirements = function(reqs)
{
    if (!reqs) {
        return true;
    }
    
    var i = 0;

    for (/* omitted */; i < reqs.length; i++) {
        if (!this.hasRequirement(reqs[i])) {
            return false;
        }
    }
    
    return true;
};

/**
 * Determines if the current instance has the passed requirement available.
 * 
 * @param {String} req
 * @returns {Boolean}
 */
MetaLoader.prototype.hasRequirement = function(req)
{
    var i = 0;

    for (/* omitted */; i < this.conditionsMet.length; i++) {
        if (this.conditionsMet[i].toLowerCase() === req.toLowerCase()) {
            return true;
        }
    }

    return false;
};

module.exports = MetaLoader;
