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
            id        : 'module',
            question  : 'Choose the Module for which we generate the model.',
            prompt    : 'Module',
            values    : modules.modules,
            default   : modules.modules[0]
        }),

        question({
            id        : 'name',
            question  : 'Enter the model name.',
            prompt    : 'Name',
            hint      : 'Singular, PascalCase, Normal variable name declaration'
        }),

        question({
            id        : 'softdelete',
            question  : 'Enable soft-deletion (entity will be marked as deleted instead of real deletion)?',
            prompt    : 'Soft-deletion',
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
                values   : [
                    'string',
                    'string/fullname',
                    'string/email',
                    'string/phone',
                    'string/wordgroup',
                    'string/domain',
                    'string/tld',
                    'string/md5',
                    'string/sha512',
                    'text',
                    'integer',
                    'float',
                    'date',
                    'boolean'
                ]
            }),
            question({
                id       : 'default',
                question : 'Define a default value for the property.',
                prompt   : 'Default',
                validator : /.?/gi
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
            var modulesModels = projectHelper.listModelsForAllModules(process.cwd());
            var matched       = [];

            Object.keys(modulesModels).forEach(function(module) {

                if (module !== result.module) {
                    return;
                }

                if (modulesModels[result.module].hasOwnProperty(result.connection)) {
                    matched = matched.concat(modulesModels[result.module][result.connection]);
                }
            });

            if (0 !== matched.length) {

                question.options.hint += ' and dont use one of the following names:\n';
                question.options.hint += '     * '.red + matched.join('\n     * '.red);

                question.options.validator = function(input)
                {
                    if (-1 === matched.indexOf(input)) {
                        if (null !== input.match(/^[a-z_][a-z0-9_.]*$/gi)) {
                            return true;
                        }
                    }

                    return false;
                };
            }
        }

        if ('properties' === question.id) {

            question.preAsk = function(question, callback)
            {
                if (0 !== propsCache.length && 'name' === question.id) {

                    if (0 === propsCache.length) {
                        question.options.hint += ' and dont use one of the following names:';
                    }

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
            };

            question.postAsk = function(results, callback)
            {
                results.forEach(function(item) {

                    if ('name' !== item.id) {
                        return;
                    }

                    propsCache.push(item.value.result);
                });

                callback && callback();
            };
        }

        question.ask(function(err, data) {

            result[data.id] = data.result;

            callback && callback(err, data);
        });

    }, function(err, results) {

        if (4 >= Object.keys(results).length) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.');
            return;
        }

        // Reformat the resultset
        results = commandHelper.dialogResultsFormat(results);
        results.namePlural = (require('inflection')).pluralize(results.name);
        results.namePluralLowerCase = results.namePlural.toLowerCase();

        var backend = results.connection.split('.')[0];

        // Result cleanup
        if ('y' == results.softdelete) {
            results.softdelete = true;
        } else {
            results.softdelete = false;
        }

        if (results.properties) {

            results.properties.forEach(function(item, idx) {

                results.properties[idx].fixture = 'utils.content.';

                if ('' === item.default) {
                    item.default = false;
                }

                if ('string' == item.type) {
                    results.properties[idx].fixture += 'word()';
                }

                if ('string/wordgroup' == item.type) {
                    results.properties[idx].fixture += 'wordgroup()';
                    item.type = 'string';
                }

                if ('string/fullname' == item.type) {
                    results.properties[idx].fixture += 'fullname()';
                    item.type = 'string';
                }

                if ('string/email' == item.type) {
                    results.properties[idx].fixture += 'email()';
                    item.type = 'string';
                    results.properties[idx].typeValidation = 'isEmail: true,';
                }

                if ('string/phone' == item.type) {
                    results.properties[idx].fixture += 'phone()';
                    item.type = 'string';
                }

                if ('string/domain' == item.type) {
                    results.properties[idx].fixture += 'domain()';
                    item.type = 'string';
                }

                if ('string/tld' == item.type) {
                    results.properties[idx].fixture += 'tld()';
                    item.type = 'string';
                }

                if ('string/md5' == item.type) {
                    results.properties[idx].fixture += 'md5()';
                    item.type = 'string';
                }

                if ('string/sha512' == item.type) {
                    results.properties[idx].fixture += 'sha512()';
                    item.type = 'string';
                }

                if ('text' == item.type) {
                    results.properties[idx].fixture += 'text()';
                }

                if ('integer' == item.type) {
                    results.properties[idx].fixture += 'integer(1, 1000)';
                    item.default = (item.default) ? parseInt(item.default) : false;
                    results.properties[idx].typeValidation = 'isInt: true,';
                }

                if ('float' == item.type) {
                    results.properties[idx].fixture += 'float(1, 1000)';
                    item.default = (item.default) ? parseFloat(item.default) : false;
                    results.properties[idx].typeValidation = 'isFloat: true,';
                }

                if ('date' == item.type) {
                    results.properties[idx].fixture += 'date()';
                    // results.properties[idx].typeValidation = 'isDate: true,';
                }

                if ('boolean' == item.type) {
                    results.properties[idx].fixture += 'boolean()';
                    item.default = (item.default) ? (('true' == item.default) ? 'true' : 'false') : false;
                }

                if ('y' == item.nullable) {

                    results.properties[idx].nullable = 'true';
                    results.properties[idx].notEmpty = 'false';
                    results.properties[idx].fixture = 'utils.content.optional(' +
                                                      results.properties[idx].fixture + ')';

                } else {
                    results.properties[idx].nullable = 'false';
                    results.properties[idx].notEmpty = 'true';
                }

                if ('float' != item.type &&
                    'integer' != item.type &&
                    'boolean' != item.type) {
                    item.default = (item.default) ? ('\'' + item.default + '\'') : false;
                }

                if (item.default) {
                    results.properties[idx].fixture = item.default;
                }

                if ('mysql' === backend) {
                    results.properties[idx].type = item.type.toUpperCase();
                } else if ('mongodb' === backend) {

                    if ('float' == item.type || 'integer' == item.type) {
                        item.type = 'number';
                    }

                    if ('text' == item.type) {
                        item.type = 'string';
                    }

                    results.properties[idx].type = item.type.capitalize();
                }
            });

        } else {
            results.properties = false;
        }

        commandHelper.generateScaffoldsByConfig([
            {
                name     : results.name + '.js',

                template : __dirname + '/../../../templates/scaffolds/db/' +
                           backend + '/model.js.mustache',

                path     : process.cwd() + '/modules/' + results.module +
                           '/models/' + results.connection + '/'
            },
            {
                name     : (require('moment'))().format('YYYYMMDDHHmmss') +
                           '-add_' + results.name.toLowerCase() + '_' +
                           ('mongodb' == backend ? 'collection' : 'table') + '.js',

                template : __dirname + '/../../../templates/scaffolds/db/' +
                           backend + '/migration.js.mustache',

                path     : process.cwd() + '/database/migrations/' +
                           results.connection + '/'
            },
            {
                name     : '00-' + results.name.toLowerCase() + '.js',

                template : __dirname + '/../../../templates/scaffolds/db/' +
                           backend + '/fixture.js.mustache',

                path     : process.cwd() + '/database/fixtures/' +
                           results.connection + '/'
            }
        ], results);
    });
};

