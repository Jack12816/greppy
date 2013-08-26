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
            question  : 'Should we mark entries as deleted or delete them really?',
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
            })
        ])

    ];

    var result = {};

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

        question.ask(function(err, data) {

            result[data.id] = data.result;

            callback && callback(err, data);
        });

    }, function(err, results) {

        // Reformat the resultset
        results = commandHelper.dialogResultsFormat(results);
        results.namePlural = (require('inflection')).pluralize(results.name);

        console.log(
            JSON.stringify(results, null, '    ')
        );
    });
}

