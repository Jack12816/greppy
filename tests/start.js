/**
 * Main entry point for starting the tests.
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var Mocha               = require('mocha');
var execBefore          = require('./before.js');
var execAfter           = require('./after.js');
var metas               = require('./metas');
var Manager             = require('./helper/manager');
var unitTestPath        = __dirname + '/unit/greppy/';
var integrationTestPath = __dirname + '/integration/greppy/';

var mocha = new Mocha({
    reporter: (process.argv[4] === '--reporter' && process.argv[5]) ?
            process.argv[5] : 'list'
});

var testType = (process.argv[2] === '--type' &&
        process.argv[3] === 'integration') ? 'integration' : 'unit';

var testPath = (testType === 'unit') ? unitTestPath : integrationTestPath;

var tm = new Manager(mocha, metas, testPath);

// special stuff like before and after is only needed for integration testing
if (testType === 'integration') {
    tm.setBefore(execBefore);
    tm.setAfter(execAfter);
    tm.enable('testTests');
    tm.enable('hasTestProject');
}

tm.run();

