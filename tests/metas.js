/**
 * This file contains meta information for the tests, like paths, requirements and sorting.
 * 
 * Keys per object:
 *   {String} file: Relative path to the file, as seen from the greppy-test root.
 *   {Number} order: (optional) When this test should be executed.
 *   {Array} terms: (optional) Array of strings which represent requirements for this test to run.
 *   
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

module.exports = [
    {
        file       : 'lib/helper/test/projectTests.js',
        conditions : ['testTests'],
        order      : 1
    }
];
