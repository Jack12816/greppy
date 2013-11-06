/**
 * Scaffolding Command
 *
 * @module greppy/cli/scaffolding/controller/empty
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(options, printHints, callback)
{
    // Print the general header
    consoleApp.heading('Generate an empty controller');
    printHints();

    var modules = projectHelper.listModules(process.cwd());
    var models  = projectHelper.listModelsForAllModules(process.cwd());

    var dialog = [

        question({
            id        : 'module',
            question  : 'Choose the module.',
            prompt    : 'Module',
            values    : modules.modules,
            default   : modules.modules[0]
        }),

        question({
            id        : 'name',
            question  : 'Enter the controller name.',
            prompt    : 'Name',
            hint      : 'Singular, lowercase'
        }),
    ];

    var result = {};
    var modelsCache = {};

    // Run the dialog
    async.mapSeries(dialog, function(question, callback) {

        question.ask(function(err, data) {

            result[data.id] = data.result;

            callback && callback(err, data);
        });

    }, function(err, results) {

        var valid = true;

        results.forEach(function(item) {

            if (!item.result) {
                valid = false;
            }
        });

        if (2 > Object.keys(results).length || !valid) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.');
            return;
        }

        commandHelper.getCurrentUser(function(err, user) {

            // Reformat the resultset
            results          = commandHelper.dialogResultsFormat(results);
            results.author   = user;
            results.headline = results.name.capitalize();

            var controllerHelper = require('../helper/controller');

            // Setup files to generate
            var generationConfig = [
                {
                    name     : results.name + '.js',

                    template : __dirname + '/../../../../templates/scaffolds/mvc/empty/' +
                               'controller.js.mustache',

                    path     : process.cwd() + '/modules/' + results.module + '/controllers/'
                }
            ];

            var viewsPath = __dirname + '/../../../../templates/scaffolds/mvc/empty/views/';
            fs.readdirSync(viewsPath).forEach(function(file) {

                generationConfig.push({
                    name: file,
                    template: viewsPath + file,
                    path: process.cwd() + '/modules/' + results.module +
                          '/resources/views/' + results.name + '/'
                });
            });

            commandHelper.generateScaffoldsByConfig(generationConfig, results);
        });
    });
};

