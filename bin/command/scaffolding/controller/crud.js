/**
 * Scaffolding Command
 *
 * @module greppy/cli/scaffolding/controller/crud
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(options, printHints, callback)
{
    // Print the general header
    consoleApp.heading('Generate a CRUD (Create-Read-Update-Delete) controller');
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
            prompt    : 'Model'
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

        if ('model' === question.id) {

            var allModels = [];

            Object.keys(models).forEach(function(module) {

                Object.keys(models[module]).forEach(function(backend) {

                    if (0 === models[module][backend].length) {
                        return;
                    }

                    models[module][backend].forEach(function(model) {

                        var cannonicalName = backend + '.' + model;

                        allModels.push(cannonicalName);
                        modelsCache[cannonicalName] = {
                            name    : model,
                            module  : module,
                            backend : backend,
                            path    : modules.path + module + '/models/'
                                        + backend + '/' + model
                        }
                    });
                });
            });

            question.options.default = allModels[0];
            question.options.values  = allModels;
        }

        if ('name' === question.id) {
            question.options.default = result.model.split('.').pop().toLowerCase();
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
            results.modelInput = results.model;
            results.backend    = backend.shift();
            results.modelName  = backend.pop();
            results.connection = results.backend + '.' + backend.join('.');
            results.model      = results.modelName;

            var controllerHelper = require('../helper/controller');
            var modelPath        = modelsCache[results.modelInput].path;

            var attributes     = controllerHelper.getModelAttributes(results.backend, modelPath);
            results.attributes = controllerHelper.mapDetails(results, attributes);

            // Setup files to generate
            var generationConfig = [
                {
                    name     : results.namePlural + '.js',

                    template : __dirname + '/../../../../templates/scaffolds/mvc/crud/'
                                + results.backend + '/controller.js.mustache',

                    path     : process.cwd() + '/modules/' + results.module
                                + '/controllers/'
                }
            ];

            var addView = function(file) {

                generationConfig.push({
                    name: file,
                    template: viewsPath + file,
                    path: process.cwd() + '/modules/' + results.module
                            + '/resources/views/' + results.namePlural + '/'
                });
            };

            var viewsPath = __dirname + '/../../../../templates/scaffolds/mvc/crud/generic/views/';
            fs.readdirSync(viewsPath).forEach(addView);

            var viewsPath = __dirname + '/../../../../templates/scaffolds/mvc/crud/' + results.backend + '/views/';
            fs.readdirSync(viewsPath).forEach(addView);

            commandHelper.generateScaffoldsByConfig(generationConfig, results);
        });
    });
}

