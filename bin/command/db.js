/**
 * Database Command
 *
 * @module greppy/cli/db
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

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
            '    ' + 'clear'.yellow + ' [adapter.connection ...]',
            '        Clear data from all|the given connection(s).',
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
            '            * fill',
            '',
            '    ' + 'refill'.yellow + ' [adapter.connection ...]',
            '        Run these operation for all|the given connection(s):',
            '            * clear',
            '            * fill'
        ].join('\n');

        console.log(help);
    };

    if (opts.options.help) {
        return printHelp();
    }

    // Find a Greppy project recursivly
    var appPath = commandHelper.findProjectOrDie();
    var configs = commandHelper.getDatabaseConfigs();

    // No operations specified, we print the database
    // configuration as a list for the current project
    if (0 === opts.argv.length) {

        if (0 === configs.namespaces.length) {

            console.log('No database configurations found.');
            return;
        }

        configs.namespaces.forEach(function(namespace) {

            var conf = commandHelper.getDatabaseConfigByNamespace(namespace, configs);

            global.table.writeRow([
                conf.source.green.bold,
                (conf.backend + '.' + conf.connection).yellow
            ]);

            if ('mysql' === conf.backend) {

                global.table.writeRow([
                    ''.white.bold,
                    (conf.username + '@' + conf.host + '/' + conf.db).white
                ]);
            }

            if ('mongodb' === conf.backend) {

                global.table.writeRow([
                    ''.white.bold,
                    conf.uri.white
                ]);
            }

            console.log();
        });

        // Done with this execution profile
        return;
    }

    // Setup the arguments to run
    var argument = argumentHelper.build(opts.argv);

    argument.setCommands({
        atomic: ['create', 'drop', 'migrate', 'fill', 'clear'],
        combined: {
            build: ['create', 'migrate', 'fill'],
            rebuild: ['drop', 'create', 'migrate', 'fill'],
            refill: ['clear', 'fill']
        }
    });

    argument.setValidator(commandHelper.checkDatabaseNamespace);

    // Build the operations chain
    var operations = argument.parse();

    // Actually run the parsed operations
    async.eachSeries(operations, function(operation, callback) {

        console.log('Run ' + operation.name.yellow + ' for ' + operation.options.join(', '));

        var dbConfigs = [];

        operation.options.forEach(function(namespace) {

            dbConfigs.push(
                commandHelper.getDatabaseConfigByNamespace(namespace, configs)
            );
        });

        // Run operation per config in series
        async.eachSeries(dbConfigs, function(config, callback) {

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
            connection[operation.name](callback);

        }, function(err) {

            if (err) {
                callback && callback(err);
                return;
            }

            callback && callback();
        });

    }, function(err) {

        if (err) {
            console.log(err);
            return;
        }
    });
};

