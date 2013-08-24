/**
 * Assets command
 *
 * @module greppy/cli/assets
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs'); var path   = require('path'); var colors =
require('colors'); var async  = require('async');
var Table  = require('tab');

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
    }

    if (opts.options.help) {
        return printHelp();
    }

    var appPath  = path.normalize(process.cwd() + '/');

    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 32},
            {align: 'left'}
        ]
    });

    var listModules = function()
    {
        var modulesPath = appPath + 'modules/';
        var modules    = [];

        fs.readdirSync(modulesPath).forEach(function(module) {

            if (!fs.statSync(modulesPath + module).isDirectory()) {
                return;
            }

            var assetsPath = modulesPath + module + '/resources/public/';

            if (!fs.existsSync(assetsPath)) {
                return;
            }

            if (!fs.statSync(assetsPath).isDirectory()) {
                return;
            }

            modules.push(module);
        });

        return modules;
    }

    var commands         = ['install'];
    var commandsChain    = {};
    var commandsToRun    = [];
    var currentOperation = '';

    // Build the command chain
    opts.argv.forEach(function(arg) {

        if (-1 !== commands.indexOf(arg)) {

            currentOperation   = arg;
            commandsChain[arg] = {
                opts: []
            };

            return;
        }

        commandsChain[currentOperation].opts.push(arg);
    });

    var modules = listModules();

    Object.keys(commandsChain).forEach(function(command) {

        if (0 === commandsChain[command].opts.length) {
            commandsChain[command].opts = modules;
        } else {

            commandsChain[command].opts.forEach(function(module) {

                if (!fs.existsSync(appPath + module)) {

                    console.log('Module ' + module.green.bold + ' does not exists.');
                    process.exit(1);
                    return;
                }
            });
        }

        // Atomic operation
        commandsToRun.push({
            command : command,
            opts    : commandsChain[command].opts
        });
    });

    commandsToRun.forEach(function(command) {

        // Install operation
        if ('install' === command.command) {

            console.log('Run ' + command.command.yellow + ' for ' + command.opts.join(', '));
            console.log();

            command.opts.forEach(function(module) {

                var assetsSrcPath  = appPath + 'modules/' + module + '/resources/public';
                var assetsDestPath = appPath + 'public/modules/' + module;
                var task           = '';
                var perform        = true;

                try {

                    if (fs.lstatSync(assetsDestPath).isSymbolicLink()) {
                        fs.unlinkSync(assetsDestPath);
                        task = 'renew'.cyan.green;
                    } else {
                        task    = 'skip'.bold.red;
                        perform = false;
                    }

                } catch (e) {
                    task = 'new'.bold.green
                }

                table.writeRow([
                    task,
                    assetsSrcPath.replace(appPath, '').replace(module, module.red).green
                    + ' -> '
                    + assetsDestPath.replace(appPath, '').replace(module, module.red).white
                ]);

                if (perform) {
                    fs.symlinkSync(assetsSrcPath, assetsDestPath);
                }
            });
        }
    });
}

