/*
 * Main entry point for starting the tests.
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var Mocha             = require('mocha');
var execBefore        = require('./before.js');
var execAfter         = require('./after.js');
var TestLoader        = require('../lib/helper/test/loader');
var TestManager        = require('../lib/helper/test/manager');
var testPath          = __dirname + '/greppy/';
var skipCreateProject = false;

var mocha = new Mocha();
var ph    = new PathHelper();
var tl    = new TestLoader(require('./metas'), testPath);
var tm    = new TestManager(mocha);

tm.setBefore(execBefore);
tm.setAfter(execAfter);
tm.addTests(tl.getTests());

tl.runTests();

console.log('Starting tests...');

mocha.run(function(exitCode) {
    execAfter();
    process.exit(exitCode);
});

