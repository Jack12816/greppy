/**
 * Reload Command
 *
 * @module greppy/cli/reload
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(opts)
{
    // Find a Greppy project recursivly
    commandHelper.findProjectOrDie();

    var contexts = projectHelper.listContexts(process.cwd());

    // Start all contexts with the found start script
    contexts.contexts.forEach(function(context) {

        if (!processHelper.isContextRunning(process.cwd(), context)) {

            global.table.writeRow([
                context.bold.green,
                new String(
                    'is not running '.red.bold
                    + '- skip reloading'
                ).white
            ]);

            return console.log();
        }

        var pid = processHelper.getPidForContext(process.cwd(), context);

        childProcess.exec('/bin/kill -s SIGHUP ' + pid, function(err, stdout, stderr) {

            if (err) {

                 global.table.writeRow([
                    context.bold.green,
                    new String(
                        'context is running '.green
                        + '- sending SIGHUP: '
                        + 'failed.'.red

                    ).white
                ]);

                console.log(new String(err).red);
                return console.log();
            }

            global.table.writeRow([
                context.bold.green,
                new String(
                    'context is running '.green
                    + '- sending SIGHUP: '
                    + 'reloaded.'.bold.green
                ).white
            ]);

            console.log();
        });
    });
}

