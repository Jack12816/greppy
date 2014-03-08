/**
 * Main entry point for starting the tests.
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var Mocha      = require('mocha');
var execBefore = require('./before.js');
var execAfter  = require('./after.js');
var metas      = require('./metas');
var Manager    = require('./helper/manager');
var testPath   = __dirname + '/greppy/';

var mocha = new Mocha({
    reporter: (process.argv[2] === '--reporter' && process.argv[3]) ? process.argv[3] : 'list'
});

var tm = new Manager(mocha, metas, testPath);

tm.setBefore(execBefore);
tm.setAfter(execAfter);
tm.enable('testTests');
tm.enable('hasTestProject');

tm.run();

