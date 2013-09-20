/**
 * The test-loader can load meta-tests and normal tests while providing a unified
 * access structure for them. 
 * 
 * @module greppy/helper/test/loader
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

/**
 * @constructor
 * @param {Array} metas The meta informations of the tests to process
 */
var Loader = function(metas)
{
    this.availableReqs = [];
    this.metas = metas;
    this.tests = null;
};

/**
 * Tell the loader that a specified requirement will be available.
 * 
 * @param {String} req String representation of the requirement which is considered available.
 * @returns {undefined}
 */
Loader.prototype.addAvailable = function(req)
{
    this.availableReqs.push(req);
};

/**
 * Returns a sorted array with one object per test. Keys of the object:
 * command: May be 'test' or 'skip'.
 * file: the filepath for the test.
 * 
 * @returns {Array}
 */
Loader.prototype.getTests = function()
{
    var metas = this.sortMetas(this.metas);
    
    return this.toTests(metas);
};

/**
 * Sorts the meta-objects by their order-property.
 * An order of 0 puts the meta before every meta with no specified order.
 * An order above zero puts the meta after every meta with no specified order.
 * Of course, the different numbers above 0 are still relevant for sorting. 
 *
 * @param {Array} metas
 * @returns {Array} Sorted metas
 */
Loader.prototype.sortMetas = function(metas)
{
    return metas.sort(function(a, b) {
        
        // both have no order
        if (('number' !== typeof a.order) &&
                ('number' !== typeof b.order)) {
            return 0;
        }
        
        // a has an order, b hasn't
        if (('number' === typeof a.order) && 
                ('number' !== typeof b.number)) {
            return (a.order === 0) ? -1 : 1;
        }
        
        // b has an order, a hasn't
        if (('number' === typeof b.order) &&
                ('number' !== typeof a.order)) {
            return (b.order === 0) ? 1 : -1;
        }
        
        // both have an order
        if (a.order === b.order) {
            return 0;
        }
        
        return (a.order < b.order) ? -1 : 1;
    });
};

/**
 * Converts the metas to test objects.
 * 
 * @param {Array} metas
 * @returns {Array}
 */
Loader.prototype.toTests = function(metas)
{
    var tests = [];
    
    metas.forEach(function(meta) {
        tests.push({
            file: meta.file,
            command: this.hasAllRequirements(meta.requirements) ? 'test' : 'skip'
        });
    });
    
    return tests;
};

/**
 * Determines if the current instance has all passed requirements available.
 * 
 * @param {Array} reqs
 * @returns {Bool}
 */
Loader.prototype.hasAllRequirements = function(reqs)
{
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
Loader.prototype.hasRequirement = function(req)
{
    var i = 0;

    for (/* omitted */; i < this.availableReqs.length; i++) {
        if (this.availableReqs[i].toLowerCase() === req.toLowerCase()) {
            return true;
        }
    }

    return false;
};

module.exports = Loader;
