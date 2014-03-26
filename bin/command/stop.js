/**
 * Stop Command
 *
 * @module greppy/cli/stop
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(contexts, force)
{
    // Find a Greppy project recursivly
    var appPath = commandHelper.findProjectOrDie();
    contexts    = commandHelper.checkContexts(contexts || []);

    // Shutdown all configured contexts
    contexts.contexts.forEach(function(context) {

        var state     = processHelper.getContextState(process.cwd(), context);
        var isStopped = commandHelper.checkForStoppedContextState(state);

        if (isStopped) {
            return;
        }

        // Use SIGINT as default, with force use SIGKILL
        var signal = (true === force) ? 9 : 2;

        processHelper.kill(state.pid, signal, function(err) {

            if (err) {

                return global.table.writeRow([
                    'stop'.bold.red,
                    (
                        context + ' -- ' + 'failed'.red +
                        ' to stop ' + state.pid + ' (err: ' + err + ')'
                    ).white
                ]);
            }

            global.table.writeRow([
                'stop'.bold.green,
                (context + ' -- stopped (' + state.pid + ')').white
            ]);
        });
    });
};

