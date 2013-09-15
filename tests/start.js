/*
 * Main entry point for starting the tests.
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var Mocha             = require('mocha');
var execBefore        = require('./before.js');
var execAfter         = require('./after.js');
var PathHelper        = require('../lib/helper/path');
var testPath          = __dirname + '/greppy/';
var skipTestTests     = true;
var skipCreateProject = false;

var mocha = new Mocha();
var ph    = new PathHelper();

ph.list(testPath).forEach(function(file) {

    if (skipTestTests && file.indexOf('lib/helper/test/') > -1) {
        console.log('Skipping tests of ' + file);
        return;
    }
    mocha.addFile(file);
});

execBefore(skipCreateProject);

console.log('Starting tests...');

mocha.run(function(exitCode) {
    execAfter();
    process.exit(exitCode);
});

