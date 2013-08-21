/**
 * Stop command
 *
 * @module greppy/cli/stop
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var path   = require('path');
var colors = require('colors');
var daemon = require('daemon');
var Table  = require('tab');

exports.run = function(contexts, callback)
{
    contexts    = require('../helpers/context').getContextsByArgs(contexts);
    var appPath = path.normalize(process.cwd() + '/');

    if (!contexts) {
        console.log(appPath.green.bold + ' is not a Greppy project.');
        process.exit(1);
        return;
    }

    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 32},
            {align: 'left'}
        ]
    });

    // Start all contexts with the found start script
    contexts.forEach(function(context) {

        var running = false;
        var pidFile = appPath + 'var/run/' + context + '.pid';

        if (fs.existsSync(pidFile)) {

            var existingPid = fs.readFileSync(pidFile, 'utf8');

            if (fs.existsSync('/proc/' + existingPid + '/status')) {
                running = true;
            }
        }

        if (running) {

            var child = require('child_process').spawn('kill', ['-2', existingPid]);

            child.on('close', function(code) {

                if (0 == code) {

                    table.writeRow([
                        'stop '.bold.green,
                        new String(context + ' -- stopped (' + existingPid + ')').white
                    ]);

                } else {

                    table.writeRow([
                        'stop '.bold.red,
                        new String(
                            context + ' -- ' + 'failed'.red
                            + ' to stop ' + existingPid + ' (err: ' + code + ')'
                        ).white
                    ]);
                }

                callback && callback();
            });

            return;
        }

        table.writeRow([
            'stop '.bold.green,
            new String(context + ' -- already stopped').white
        ]);

        callback && callback();
    });
}

