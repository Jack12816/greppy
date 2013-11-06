/**
 * Scaffolding Command
 *
 * @module greppy/cli/scaffolding/context
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(options, printHints, callback)
{
    // Print the general header
    consoleApp.heading('Generate an CRUD controller');
    printHints();

    var modules = projectHelper.listModules(process.cwd());
    var models  = projectHelper.listModelsForAllModules(process.cwd());

    var dialog = [

        question({
            id       : 'name',
            question : 'Enter the context name.',
            prompt   : 'Name',
            hint     : 'Singular, PascalCase'
        }),

        question({
            id       : 'description',
            question : 'Write a description for the context.',
            prompt   : 'Description'
        }),

        question({
            id       : 'module',
            question : 'Choose the module(s).',
            prompt   : 'Module',
            values   : modules.modules,
            default  : modules.modules[0]
        }),

        question({
            id       : 'port',
            question : 'Choose the default port.',
            prompt   : 'Port',
            default  : 3000
        }),
    ];

    var result = {};

    // Run the dialog
    async.mapSeries(dialog, function(question, callback) {

        question.ask(function(err, data) {

            result[data.id] = data.result;

            callback && callback(err, data);
        });

    }, function(err, results) {

        if (2 >= Object.keys(results).length) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.');
            return;
        }

        var inf = require('inflection');

        commandHelper.getCurrentUser(function(err, user) {

            // Reformat the resultset
            results = commandHelper.dialogResultsFormat(results);

            results.nameLower   = results.name.toLowerCase();
            results.author      = user;
            results.modules     = '\'' + results.module + '\'';
            results.projectName = (require(process.cwd() + '/package')).name;

            // Setup files to generate
            var generationConfig = [
                {
                    name     : results.nameLower + '.js',

                    template : __dirname + '/../../../templates/scaffolds/' +
                               'context.js.mustache',

                    path     : process.cwd() + '/app/context/'
                }
            ];

            commandHelper.generateScaffoldsByConfig(generationConfig, results);
        });
    });
};

