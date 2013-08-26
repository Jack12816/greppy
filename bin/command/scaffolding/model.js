/**
 * Scaffolding Command
 *
 * @module greppy/cli/scaffolding/model
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(options, printHints, callback)
{
    // Print the general header
    consoleApp.heading('Generate database equipment');
    printHints();

    var modules   = projectHelper.listModules(process.cwd());
    var dbConfigs = commandHelper.getDatabaseConfigs();

    var dialog = [

        question({
            id        : 'connection',
            question  : 'Choose the backend connection.',
            prompt    : 'Connection',
            values    : dbConfigs.namespaces,
            default   : dbConfigs.namespaces[0]
        }),

        question({
            id        : 'name',
            question  : 'Enter the model name.',
            prompt    : 'Name',
            hint      : 'Singular, PascalCase, Normal variable name declaration'
        }),

        question({
            id        : 'module',
            question  : 'Choose the Module for which we generate the model.',
            prompt    : 'Module',
            values    : modules.modules,
            default   : modules.modules[0]
        }),

        question({
            id        : 'softdelete',
            question  : 'Enable soft-deletion (entity will be marked instead of deletion)?',
            prompt    : 'Module',
            values    : ['y', 'n'],
            default   : 'y'
        }),

        questionSet({
            id          : 'properties',
            description : 'You can now define all properties of the model.',
            repeat      : true
        }, [
            question({
                id        : 'name',
                question  : 'Choose name of the model property.',
                prompt    : 'Name',
                hint      : 'Normal variable name declaration',
                validator : /^[a-z_][a-z0-9_]*$/gi
            }),
            question({
                id       : 'type',
                question : 'Choose type of the model property.',
                prompt   : 'Type',
                default  : 'string',
                values   : ['string', 'text', 'integer', 'float', 'date', 'boolean']
            }),
            question({
                id       : 'nullable',
                question : 'Is this property nullable?',
                prompt   : 'Nullable',
                default  : 'n',
                values   : ['y', 'n']
            })
        ])

    ];

    var result     = {};
    var propsCache = [];

    // Run the dialog
    async.mapSeries(dialog, function(question, callback) {

        if ('name' === question.id) {

            // Search all models for the choosen connection
            var models = projectHelper.listModels(process.cwd());
            var matched = [];

            if (models.hasOwnProperty(result.connection)) {
                matched = models[result.connection];
            }

            question.options.hint += ' and dont use one of the following names:\n';
            question.options.hint += '     * '.red + matched.join('\n     * '.red)

            question.options.validator = function(input)
            {
                if (-1 === matched.indexOf(input)) {
                    if (null !== input.match(/^[a-z_][a-z0-9_]*$/gi)) {
                        return true;
                    }
                }

                return false;
            };
        }

        if ('properties' === question.id) {

            question.preAsk = function(question, callback)
            {
                if (0 === propsCache.length) {
                    question.options.hint += ' and dont use one of the following names:';
                }

                if (0 !== propsCache.length && 'name' === question.id) {

                    var last = propsCache.pop();
                    question.options.hint += '\n     * '.red + last;
                    propsCache.push(last);

                    question.options.validator = function(input)
                    {
                        if (-1 === propsCache.indexOf(input)) {
                            if (null !== input.match(/^[a-z_][a-z0-9_]*$/gi)) {
                                return true;
                            }
                        }

                        return false;
                    };
                }

                callback && callback();
            }

            question.postAsk = function(results, callback)
            {
                results.forEach(function(item) {

                    if ('name' !== item.id) {
                        return;
                    }

                    propsCache.push(item.value.result);
                });

                callback && callback();
            }
        }

        question.ask(function(err, data) {

            result[data.id] = data.result;

            callback && callback(err, data);
        });

    }, function(err, results) {

        if (4 >= Object.keys(results).length) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.')
            return;
        }

        // Reformat the resultset
        results = commandHelper.dialogResultsFormat(results);
        results.namePlural = (require('inflection')).pluralize(results.name);

        // Result cleanup
        if ('y' == results.softdelete) {
            results.softdelete = true;
        } else {
            results.softdelete = false;
        }

        if (results.properties) {

            results.properties.forEach(function(item, idx) {

                if ('y' == item.nullable) {
                    results.properties[idx].nullable = 'true';
                } else {
                    results.properties[idx].nullable = 'false';
                }

                if ('string' == item.type || 'text' == item.type) {
                    results.properties[idx].fixture = "'test'";
                }

                if ('integer' == item.type) {
                    results.properties[idx].fixture = 1337;
                }

                if ('float' == item.type) {
                    results.properties[idx].fixture = 13.37;
                }

                if ('date' == item.type) {
                    results.properties[idx].fixture = "new Date()";
                }

                if ('boolean' == item.type) {
                    results.properties[idx].fixture = 'true';
                }

                results.properties[idx].type = item.type.toUpperCase();
            });

        } else {
            results.properties = false;
        }

        var backend = results.connection.split('.')[0];

        commandHelper.generateScaffoldsByConfig([
            {
                name     : results.name + '.js',

                template : __dirname + '/../../../templates/scaffolds/db/'
                            + backend + '/model.js.mustache',

                path     : process.cwd() + '/modules/' + results.module
                            + '/models/' + results.connection + '/'
            },
            {
                name     : (require('moment'))().format('YYYYMMDDHHmmss')
                            + '-add_' + results.name.toLowerCase() + '_table.js',

                template : __dirname + '/../../../templates/scaffolds/db/'
                            + backend + '/migration.js.mustache',

                path     : process.cwd() + '/database/migrations/'
                            + results.connection + '/'
            },
            {
                name     : '00-' + results.name.toLowerCase() + '.js',

                template : __dirname + '/../../../templates/scaffolds/db/'
                            + backend + '/fixture.js.mustache',

                path     : process.cwd() + '/database/fixtures/'
                            + results.connection + '/'
            }
        ], results);
    });
}

