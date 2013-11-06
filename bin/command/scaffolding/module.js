/**
 * Scaffolding Command
 *
 * @module greppy/cli/scaffolding/module
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(options, printHints, callback)
{
    // Print the general header
    consoleApp.heading('Generate a module');
    printHints();

    var modules = projectHelper.listModules(process.cwd());
    var models  = projectHelper.listModelsForAllModules(process.cwd());

    var dialog = [

        question({
            id       : 'name',
            question : 'Enter the module name.',
            prompt   : 'Name',
            hint     : 'Singular'
        })
    ];

    var result = {};

    // Run the dialog
    async.mapSeries(dialog, function(question, callback) {

        question.ask(function(err, data) {

            result[data.id] = data.result;

            callback && callback(err, data);
        });

    }, function(err, results) {

        // Reformat the resultset
        results = commandHelper.dialogResultsFormat(results);

        if (undefined === results.name) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.');
            return;
        }

        results.nameCaped = results.name.capitalize();

        var modulesPath = process.cwd() + '/modules/' + results.name + '/';

        // Setup files to generate
        var generationConfig = [
            modulesPath.replace(/\/$/, ''),
            modulesPath + 'controllers',
            modulesPath + 'helpers',
            modulesPath + 'models',
            modulesPath + 'resources',
            modulesPath + 'resources/public',
            modulesPath + 'resources/public/css',
            modulesPath + 'resources/public/img',
            modulesPath + 'resources/public/js',
            modulesPath + 'resources/views',
            modulesPath + 'resources/views/error',
            modulesPath + 'resources/views/layout'
        ];

        commandHelper.generateScaffoldPaths(generationConfig);

        // Setup files to generate
        generationConfig = [];
        var viewsPath    = (require('path')).normalize(
            __dirname + '/../../../templates/scaffolds/module/views'
        );

        pathHelper.list(viewsPath).forEach(function(file) {

            var rel = (require('path')).dirname(file).replace(viewsPath, '');

            generationConfig.push({
                name: (require('path')).basename(file),
                template: file,
                path: (require('path')).normalize(modulesPath + 'resources/views' + rel) + '/'
            });
        });

        commandHelper.generateScaffoldsByConfig(generationConfig, results, false);

        global.table.writeRow(['run '.bold.green, 'greppy --assets install'.white]);
        childProcess.exec('greppy --assets install', function(err, stdout, stderr) {

            if (err) {
                global.table.writeRow(['error '.bold.red, err]);
            }
        });
    });
};

