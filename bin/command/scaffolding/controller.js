/**
 * Scaffolding Command
 *
 * @module greppy/cli/scaffolding/controller
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
            id        : 'module',
            question  : 'Choose the module.',
            prompt    : 'Module',
            values    : modules.modules,
            default   : modules.modules[0]
        }),

        question({
            id        : 'model',
            question  : 'Choose the model.',
            prompt    : 'Module'
        }),

        question({
            id        : 'name',
            question  : 'Enter the controller name.',
            prompt    : 'Name',
            hint      : 'Singular, lowercase'
        }),
    ];

    var result = {};

    // Run the dialog
    async.mapSeries(dialog, function(question, callback) {

        if ('model' === question.id) {

            if (models.hasOwnProperty(result.module)) {

                var allModels = [];

                Object.keys(models[result.module]).forEach(function(backend) {

                    if (0 === models[result.module][backend].length) {
                        return;
                    }

                    models[result.module][backend].forEach(function(model) {
                        allModels.push(backend + '.' + model);
                    });
                });

                question.options.default = allModels[0];
                question.options.values  = allModels;
            }
        }

        if ('name' === question.id) {
            question.options.default = result.model.split('.')[2].toLowerCase();
        }

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

        if (3 > Object.keys(results).length || !valid) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.')
            return;
        }

        var inf = require('inflection');

        commandHelper.getCurrentUser(function(err, user) {

            // Reformat the resultset
            results            = commandHelper.dialogResultsFormat(results);
            results.namePlural = inf.pluralize(results.name);

            results.author = user;

            results.headline       = results.name.capitalize();
            results.headlinePlural = results.namePlural.capitalize();

            var backend        = results.model.split('.');
            results.model      = backend[2];
            results.connection = backend[0] + '.' + backend[1];

            var controllerHelper = require('./helper/controller');
            var modelPath = modules.path + results.module + '/models/'
                            + results.connection + '/' + results.model;

            var attributes = controllerHelper.getModelAttributes(backend[0], modelPath);
            results.attributes = controllerHelper.mapDetails(results, attributes);

            // Setup files to generate
            var generationConfig = [
                {
                    name     : results.namePlural + '.js',

                    template : __dirname + '/../../../templates/scaffolds/mvc/'
                                + backend[0] + '.controller.js.mustache',

                    path     : process.cwd() + '/modules/' + results.module
                                + '/controllers/'
                }
            ];

            var viewsPath = __dirname + '/../../../templates/scaffolds/mvc/view/';
            fs.readdirSync(viewsPath).forEach(function(file) {

                generationConfig.push({
                    name: file,
                    template: viewsPath + file,
                    path: process.cwd() + '/modules/' + results.module
                            + '/resources/views/' + results.namePlural + '/'
                });
            });

            commandHelper.generateScaffoldsByConfig(generationConfig, results);
        });
    });
}

