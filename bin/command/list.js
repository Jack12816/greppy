/**
 * List Command
 *
 * @module greppy/cli/list
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(opts)
{
    // Find a Greppy project recursivly
    commandHelper.findProjectOrDie();

    var contexts = projectHelper.loadContexts(
        projectHelper.listContexts(process.cwd())
    );

    // Start all contexts with the found start script
    contexts.contexts.forEach(function(context) {

        context = contexts.instance[context];

        global.table.writeRow([
            context.name.bold.green,
            context.description.white
        ]);

        global.table.writeRow([
            'modules'.white.bold,
            context.modules.join(', ')
        ]);

        console.log();
    });
}

