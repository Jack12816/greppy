/**
 * Scaffolding Command
 *
 * @module greppy/cli/scaffolding/controller
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(options, printHints, callback)
{
    // Print the general header
    consoleApp.heading('Generate a controller');

    question({
        id        : 'type',
        question  : 'Choose the type of the controller scaffold.',
        prompt    : 'Type',
        values    : ['CRUD', 'empty'],
        default   : 'CRUD'
    }).ask(function(err, data) {

        if (err || undefined === data.result) {

            console.log('[Error] '.red + 'Not all required questions were answered.');
            console.log('        Skip further generation.')
            return;
        }

        consoleApp.clear();

        try {
            (require('./controller/' + data.result.toLowerCase())).run(options, printHints, callback);
        } catch (e) {
            console.log('[Error] '.red + 'The selected type could not be loaded.')
            return;
        }
    });
}

