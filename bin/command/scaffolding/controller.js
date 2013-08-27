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

        if (2 >= Object.keys(results).length) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.')
            return;
        }

        var inf = require('inflection');

        // Reformat the resultset
        results            = commandHelper.dialogResultsFormat(results);
        results.namePlural = inf.pluralize(results.name);

        results.headline       = results.name.capitalize();
        results.headlinePlural = results.namePlural.capitalize();

        var backend        = results.model.split('.');
        results.model      = backend[2];
        results.connection = backend[0] + '.' + backend[1];

        console.log();
        console.log(results);

// controller name -> plural/lowercase default
//
// softdelete <-- model settings
//
// headlines will be model name
//
//

        // // Result cleanup
        // if ('y' == results.softdelete) {
        //     results.softdelete = true;
        // } else {
        //     results.softdelete = false;
        // }

        // if (results.properties) {

        //     results.properties.forEach(function(item, idx) {

        //         if ('y' == item.nullable) {
        //             results.properties[idx].nullable = 'true';
        //         } else {
        //             results.properties[idx].nullable = 'false';
        //         }

        //         if ('string' == item.type || 'text' == item.type) {
        //             results.properties[idx].fixture = "'test'";
        //         }

        //         if ('integer' == item.type) {
        //             results.properties[idx].fixture = 1337;
        //         }

        //         if ('float' == item.type) {
        //             results.properties[idx].fixture = 13.37;
        //         }

        //         if ('date' == item.type) {
        //             results.properties[idx].fixture = "new Date()";
        //         }

        //         if ('boolean' == item.type) {
        //             results.properties[idx].fixture = 'true';
        //         }

        //         results.properties[idx].type = item.type.toUpperCase();
        //     });

        // } else {
        //     results.properties = false;
        // }

        // var backend = results.connection.split('.')[0];

        // commandHelper.generateScaffoldsByConfig([
        //     {
        //         name     : results.name + '.js',

        //         template : __dirname + '/../../../templates/scaffolds/db/'
        //                     + backend + '/model.js.mustache',

        //         path     : process.cwd() + '/modules/' + results.module
        //                     + '/models/' + results.connection + '/'
        //     },
        //     {
        //         name     : (require('moment'))().format('YYYYMMDDHHmmss')
        //                     + '-add_' + results.name.toLowerCase() + '_table.js',

        //         template : __dirname + '/../../../templates/scaffolds/db/'
        //                     + backend + '/migration.js.mustache',

        //         path     : process.cwd() + '/database/migrations/'
        //                     + results.connection + '/'
        //     },
        //     {
        //         name     : '00-' + results.name.toLowerCase() + '.js',

        //         template : __dirname + '/../../../templates/scaffolds/db/'
        //                     + backend + '/fixture.js.mustache',

        //         path     : process.cwd() + '/database/fixtures/'
        //                     + results.connection + '/'
        //     }
        // ], results);
    });
}

