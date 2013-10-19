/**
 * This file contains meta information for the tests, like paths,
 * requirements and sorting.
 *
 * Keys per object:
 *   {String} file         Relative path to the file, as seen from the
 *                         greppy-test root.
 *   {Array}  [conditions] Array of strings which represent
 *                         conditions for this test to run.
 *   {Number} [order]      When this test should be executed.
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

module.exports = [
    {
        file       : 'lib/helper/test/projectTests.js',
        conditions : ['testTests'],
        order      : 1
    },
    {
        file       : 'lib/helper/projectTests.js',
        conditions : ['hasTestProject']
    },
    {
        file       : 'lib/app/workerTests.js',
        conditions : ['hasTestProject']
    }
];

