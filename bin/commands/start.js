/**
 * Start command
 *
 * @module greppy/cli/start
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var path   = require('path');
var colors = require('colors');
var daemon = require('daemon');
var Table  = require('tab');

exports.run = function(opts)
{
    var contexts = opts.split(',');
    var appPath = path.normalize(process.cwd() + '/');

    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 32},
            {align: 'left'}
        ]
    });

    var startScript = 'worker.js';
    var nodeBin = 'node';

    // Find the implementation
    fs.readdirSync(appPath + 'app').some(function(file) {

        if (file.match(/master/gi) && file.match(/\.js$/gi)) {
            startScript = file;
            return true;
        }
    });

    startScript = appPath + 'app/' + startScript;

    // Start all contexts with the found start script
    contexts.forEach(function(context) {

        var running = false;
        var pidFile = appPath + 'tmp/pids/' + context + '.pid';

        if (fs.existsSync(pidFile)) {

            var existingPid = fs.readFileSync(pidFile, 'utf8');

            if (fs.existsSync('/proc/' + existingPid + '/status')) {
                running = true;
            }
        }

        if (running) {
            table.writeRow([
                'start '.bold.green,
                new String(context + ' -- already running (' + existingPid + ')').white
            ]);
            return;
        }

        // Start the daemon process
        var args   = ['--context', context];
        var stderr = fs.openSync(appPath + 'var/log/' + context + '.master.stderr.log', 'a');
        var child  = daemon.daemon(startScript, args, {
            cwd    : appPath,
            stderr : stderr
        });

        // Write its pid
        fs.writeFileSync(pidFile, child.pid);

        table.writeRow([
            'start '.bold.green,
            new String(context + ' -- started (' + child.pid + ')').white
        ]);
    });
}

