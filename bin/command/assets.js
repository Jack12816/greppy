/**
 * Assets Command
 *
 * @module greppy/cli/assets
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(opts)
{
    var printHelp = function()
    {
        var help = [
            ' Atomar Operations'.green.bold,
            '',
            '    ' + 'install'.yellow + ' [module ...]',
            '        Install assets for all|the given module into /public.'
        ].join('\n');

        console.log(help);
    };

    if (opts.options.help || 0 === opts.argv.length) {
        return printHelp();
    }

    // Find a Greppy project recursivly
    var appPath = commandHelper.findProjectOrDie();

    // Setup the arguments to run
    var argument = argumentHelper.build(opts.argv);

    argument.setCommands({
        atomic: ['install']
    });

    argument.setValidator(commandHelper.checkModules);

    // Build the operations chain
    var operations = argument.parse();

    // Actually run the parsed operations
    operations.forEach(function(operation) {

        // Install operation
        if ('install' === operation.name) {

            console.log(
                'Run ' + operation.name.yellow +
                ' for ' + operation.options.modules.join(', ') + '\n'
            );

            var modulePath = operation.options.path;
            var assetsPublicPath = appPath + 'public/modules/';

            // Try to build the assetsPublicPath, on error it just exists
            try {
                (require('node-fs')).mkdirSync(assetsPublicPath, '0744', true);
            } catch (e) {
            }

            operation.options.modules.forEach(function(module) {

                var assetsSrcPath    = modulePath + module + '/resources/public';
                var assetsDestPath   = assetsPublicPath + module;
                var task             = '';
                var perform          = true;

                if (!fs.existsSync(assetsSrcPath) || !fs.statSync(assetsSrcPath).isDirectory()) {
                    return;
                }

                try {

                    if (fs.lstatSync(assetsDestPath).isSymbolicLink()) {
                        fs.unlinkSync(assetsDestPath);
                        task = 'renew'.cyan.green;
                    } else {
                        task    = 'skip'.bold.red;
                        perform = false;
                    }

                } catch (e) {
                    task = 'new'.bold.green;
                }

                table.writeRow([
                    task,
                    assetsSrcPath.replace(appPath, '').replace(module, module.red).green +
                    ' -> ' +
                    assetsDestPath.replace(appPath, '').replace(module, module.red).white
                ]);

                if (perform) {
                    fs.symlinkSync(assetsSrcPath, assetsDestPath);
                }
            });
        }
    });
};

