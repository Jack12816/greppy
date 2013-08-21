/**
 * Version command
 *
 * @module greppy/cli/version
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var colors = require('colors');
var Table  = require('tab');

exports.run = function()
{
    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 36},
            {align: 'left'}
        ]
    });

    var gitCommand = 'git log --pretty="%h by %cn ' + '<%ce>'.grey + '" -n1 HEAD';

    var greppyInfo = function(callback)
    {
        table.writeRow([
            'Greppy version'.bold.green,
            require(__dirname + '/../../package').version.white
        ]);

        if (fs.existsSync(__dirname + '/../../.git/')) {

            (require('child_process')).exec(
                gitCommand,
                {cwd: __dirname + '/../../'},
                function(err, stdout, stderr) {

                table.writeRow([
                    'Git commit'.bold.green,
                    stdout.white
                ]);

                callback && callback();
            });
        }
    }

    var cwdInfo = function(callback)
    {
        if (fs.existsSync('package.json')) {

            var package = require(process.cwd() + '/package.json');

            table.writeRow([
                'Project in cwd'.bold.green,
                new String(
                    package.name
                    + new String(' <' + package.description + '>').grey
                ).white
            ]);

            table.writeRow([
                'Version'.bold.green,
                package.version.white
            ]);

            if (fs.existsSync('.git/')) {

                (require('child_process')).exec(
                    gitCommand,
                    function(err, stdout, stderr) {

                    table.writeRow([
                        'Git commit'.bold.green,
                        stdout.white
                    ]);

                    callback && callback();
                });
            }
        }
    }

    greppyInfo(cwdInfo);
}

