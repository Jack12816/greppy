/*
 * Main entry point for starting the tests.
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var Mocha             = require('mocha');
var execBefore        = require('./before.js');
var execAfter         = require('./after.js');
var metas             = require('./metas');
var Manager           = require('../lib/helper/test/manager');
var testPath          = __dirname + '/greppy/';
var skipCreateProject = false;

var mocha = new Mocha();
var tm    = new Manager(mocha, metas, testPath);

tm.setBefore(execBefore);
tm.setAfter(execAfter);
tm.enable('testTests');

tm.run();
