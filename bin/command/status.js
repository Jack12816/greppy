/**
 * Status Command
 *
 * @module greppy/cli/status
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
                    'is not running'.red.bold
                ).white
            ]);

            return console.log();
        }

        var pid = processHelper.getPidForContext(process.cwd(), context);

        // Find child of the context pid
        var pids = [pid].concat(processHelper.findChilds(pid));

        // Get the memory usage of the context pids
        var memoryByPid = processHelper.getMemoryUsage(pids);

        global.table.writeRow([
            context.bold.green,
            new String(
                'context is running '.green
                + '(parent is ' + pid + ')'
            ).white
        ]);

        memoryByPid.forEach(function(res) {

            global.table.writeRow([
                new String( res.pid || 'total' ).white.bold,
                new String(
                    ((res.pid) ? 'used ' : '') + res.usage
                ).white
            ]);
        });

        console.log();
    });
}

