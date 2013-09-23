/**
 * Manages the execution of tests.
 *
 * @module greppy/helper/test/manager
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var MetaLoader  = require('./loader/meta');
var PlainLoader = require('./loader/plain');
var PathHelper  = require('../path');

/**
 * @constructor
 * 
 * @param {Object} mocha An instance of mocha.
 * @param {Array} metas An array with meta objects.
 * @param {String} testPath The path which contains all tests.
 */
var Manager = function(mocha, metas, testPath)
{
    this.mocha         = mocha;
    this.metas         = metas;
    this.testPath      = testPath;
    this.tests         = [];
    this.conditionsMet = [];
    this.execBefore    = null;
    this.execAfter     = null;
};

Manager.prototype.setBefore = function(before)
{
    this.execBefore = before;
};

Manager.prototype.setAfter = function(after)
{
    this.execAfter = after;
};

/**
 * Sets terms to be enabled.
 * 
 * @param {String} term An array with one or more strings.
 * @returns {undefined}
 */
Manager.prototype.enable = function(term)
{
    this.conditionsMet.push(term);
};

/**
 * Let the show begin!
 * Fires off mocha after processing the before function.
 * 
 * @returns {undefined}
 */
Manager.prototype.run = function()
{
    var self = this;
    
    this.execBefore && this.execBefore();
    
    this.initTests();
    this.queueTests(this.tests);

    console.log();
    console.log('Starting tests...');

    this.mocha.growl().run(function(exitCode) {
        self.execAfter && self.execAfter();
        process.exit(exitCode);
    });
};

/**
 * Fills the tests-array with test-objects.
 * 
 * @returns {undefined}
 */
Manager.prototype.initTests = function()
{
    if ('string' !== typeof this.testPath) {
        throw new Error('No valid test path defined!');
    }
    
    var self      = this;
    var ph        = new PathHelper();
    var ml        = new MetaLoader(this.metas);
    var pl        = new PlainLoader();
    var testPaths = ph.list(this.testPath);
    
    ml.setNext(pl);
    ml.setConditionsMet(this.conditionsMet);
    
    testPaths.forEach(function(path) {
        
        // we want only js files
        if (path.match(/\.js$/)) {
            var relPath = path.replace(self.testPath, '');
            self.tests.push(ml.getTest(relPath));
        }
    });
    
    this.tests = this.sortTests(this.tests);
};

/**
 * Either adds tests to the mocha instance or skips them.
 * 
 * @param {Array} tests
 * @returns {undefined}
 */
Manager.prototype.queueTests = function(tests)
{
    var self    = this;
    var added   = 0;
    var skipped = 0;
    
    tests.forEach(function(test) {
        
        if ('skip' === test.command) {
            console.log('Skipping test-file: ' + test.file);
            skipped++;
            return;
        }
        
        self.mocha.addFile(self.testPath + test.file);
        added++;
    });
    
    console.log();
    console.log('Added ' + added + ' test-file(s).');
    console.log('Skipped ' + skipped + ' test-file(s).');
};

/**
 * Sorts the test-objects by their order-property. An order of 0 puts
 * the test before every test with no specified order.
 * An order above zero puts the test after every test with no specified order.
 * Of course, the different numbers above 0 are still relevant for sorting.
 *
 * @param {Array} tests
 * @returns {Array} Sorted tests
 */
Manager.prototype.sortTests = function(tests)
{
    return tests.sort(function(a, b) {

        // both have no order
        if (('number' !== typeof a.order) &&
                ('number' !== typeof b.order)) {
            return 0;
        }

        // a has an order, b hasn't
        if (('number' === typeof a.order) && 
                ('number' !== typeof b.order)) {
            return (a.order === 0) ? -1 : 1;
        }

        // b has an order, a hasn't
        if (('number' === typeof b.order) &&
                ('number' !== typeof a.order)) {
            return (b.order === 0) ? 1 : -1;
        }

        // both have the same order
        if (a.order === b.order) {
            return 0;
        }
        
        return (a.order < b.order) ? -1 : 1;
    });
};

module.exports = Manager;
