/**
 * Stop Command
 *
 * @module greppy/cli/stop
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(contexts, callback)
{
    // Find a Greppy project recursivly
    var appPath = commandHelper.findProjectOrDie();

    var contexts = commandHelper.checkContexts(contexts || []);

    // Shutdown all configured contexts
    contexts.contexts.forEach(function(context) {

        var state = processHelper.getContextState(process.cwd(), context);
        var isStopped = commandHelper.checkForStoppedContextState(state);

        if (isStopped) {
            return;
        }

        processHelper.kill(state.pid, function(err) {

            if (err) {

                return global.table.writeRow([
                    'stop'.bold.red,
                    new String(
                        context + ' -- ' + 'failed'.red
                        + ' to stop ' + state.pid + ' (err: ' + err + ')'
                    ).white
                ]);
            }

            global.table.writeRow([
                'stop'.bold.green,
                new String(context + ' -- stopped (' + state.pid + ')').white
            ]);
        });
    });
}

