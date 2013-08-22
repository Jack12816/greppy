/**
 * List command
 *
 * @module greppy/cli/list
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var path   = require('path');
var colors = require('colors');
var async  = require('async');
var Table  = require('tab');

exports.run = function(opts)
{
    var printHelp = function()
    {
        var help = [
            ' Atomar Operations'.green.bold,
            '',
            '    ' + 'create'.yellow + ' [adapter.connection ...]',
            '        Create all|the given connection backend based on the specified adapter.',
            '',
            '    ' + 'drop'.yellow + ' [adapter.connection ...]',
            '        Drop all|the given connection(s) backend based on the specified adapter.',
            '',
            '    ' + 'migrate'.yellow + ' [adapter.connection ...]',
            '        Run migrations for all|the given connection(s).',
            '',
            '    ' + 'fill'.yellow + ' [adapter.connection ...]',
            '        Fill all|the given connection(s) with its fixture data.',
            '',
            ' Combined Operations'.green.bold,
            '',
            '    ' + 'build'.yellow + ' [adapter.connection ...]',
            '        Run these operation for all|the given connection(s):',
            '            * create',
            '            * migrate',
            '            * fill',
            '',
            '    ' + 'rebuild'.yellow + ' [adapter.connection ...]',
            '        Run these operation for all|the given connection(s):',
            '            * drop',
            '            * create',
            '            * migrate',
            '            * fill'
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

    var collectConfigs = function()
    {
        var configPath = appPath + 'app/config/';
        var dbConfs    = [];

        fs.readdirSync(configPath).forEach(function(file) {

            if (!file.match(/\.js$|\.json$/gi)) {
                return;
            }

            var config = require(configPath + file);

            if (config.database) {
                dbConfs.push({
                    name   : file.replace(/\.js$|\.json$/gi, ''),
                    config : config.database
                });
            }
        });

        return dbConfs;
    }

    var configExists = function(path, configs)
    {
        var path       = path.split('.');
        var backend    = path[0];
        var connection = path[1];

        if (!backend || !connection) {
            return false;
        }

        var result = false;

        configs.some(function(config) {

            config = config.config;

            if (config.hasOwnProperty(backend)) {
                if (config[backend].hasOwnProperty(connection)) {
                    result            = config[backend][connection];
                    result.backend    = backend;
                    result.connection = connection;
                    return true;
                }
            }
        });

        return result;
    }

    var allConfigPaths = function(configs)
    {
        var paths = [];

        configs.forEach(function(config) {

            Object.keys(config.config).forEach(function(backend) {

                Object.keys(config.config[backend]).forEach(function(connection) {

                    paths.push(backend + '.' + connection)
                });
            });
        });

        return paths;
    }

    // No operations specified, we print the db-conf list for the cwd project
    if (0 === opts.argv.length) {

        var contextPath = appPath + 'app/context/';

        if (!fs.existsSync(contextPath)) {
            console.log(appPath.green.bold + ' is not a Greppy project.');
            console.log();
            return printHelp();
        }

        var configPath = appPath + 'app/config/';
        var dbConfs    = collectConfigs();

        if (0 === Object.keys(dbConfs).length) {
            console.log('No database configuration found.')
            return;
        }

        dbConfs.forEach(function(config) {

            Object.keys(config.config).forEach(function(backend) {

                table.writeRow([
                    config.name.green.bold,
                    backend.white
                ]);

                Object.keys(config.config[backend]).forEach(function(connection) {

                    var conConf = config.config[backend][connection];

                    table.writeRow([
                        connection.blue.bold,
                        conConf.username.yellow + '@'.white + conConf.host.cyan + '/'.white + conConf.db.magenta
                    ]);
                });

                console.log();
            });
        });

        return;
    }

    var commands         = ['create', 'drop', 'migrate', 'fill', 'build', 'rebuild'];
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

    var configs = collectConfigs();

    Object.keys(commandsChain).forEach(function(command) {

        if (0 === commandsChain[command].opts.length) {
            commandsChain[command].opts = allConfigPaths(configs);
        }

        // Dereference combined operation build into atomic ones
        if ('build' === command) {

            ['create', 'migrate', 'fill'].forEach(function(com) {

                commandsToRun.push({
                    command : com,
                    opts    : commandsChain[command].opts
                });
            });

            return;
        }

        // Dereference combined operation build into atomic ones
        if ('rebuild' === command) {

            ['drop', 'create', 'migrate', 'fill'].forEach(function(com) {

                commandsToRun.push({
                    command : com,
                    opts    : commandsChain[command].opts
                });
            });

            return;
        }

        // Atomic operation
        commandsToRun.push({
            command : command,
            opts    : commandsChain[command].opts
        });
    });

    // Run all operations in series
    async.eachSeries(commandsToRun, function(command, callback) {

        // Validate each given opt-path
        async.map(command.opts, function(path, callback) {

            var config = configExists(path, configs);

            if (false === config) {
                callback && callback('No configuration found for: ' + path.green.bold);
                return;
            }

            callback && callback(undefined, config);

        }, function(err, configs) {

            if (err) {
                callback && callback(err);
                return;
            }

            console.log('Run ' + command.command.yellow + ' for ' + command.opts.join(', '));

            // Run operation per config in series
            async.eachSeries(configs, function(config, callback) {

                global.logger = {
                    error : console.log,
                    info  : console.log,
                    warn  : console.log,
                    debug : console.log,
                };

                // Bootstrap the backend connection and run the operation
                var connection = new (
                    require(__dirname + '/../../lib/db/adapter/' + config.backend)
                )(config.connection, config);

                console.log();

                // Run the actual command
                connection[command.command](callback);

            }, function(err) {

                if (err) {
                    callback && callback(err);
                    return;
                }

                callback && callback();
            });
        });

    }, function(err) {

        if (err) {
            console.log(err);
            return;
        }

    });
}

