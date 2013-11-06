/**
 * Scaffolding Command
 *
 * @module greppy/cli/generate
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

consoleApp  = new (require('../../lib/app/console'))();
question    = consoleApp.buildQuestion;
questionSet = consoleApp.buildQuestionSet;

exports.run = function(opts)
{
    var printHelp = function()
    {
        var help = [
            ' Scaffolding'.green.bold,
            '',
            '    ' + 'module'.yellow,
            '        Create a new module structure.',
            '',
            '    ' + 'context'.yellow,
            '        Create a context file with predefined settings.',
            '',
            '    ' + 'model'.yellow,
            '        Create all necessary files for a complete database backend equipment.',
            '        A model, it\'s migration and a fixture for it will be generated.',
            '',
            '    ' + 'controller'.yellow,
            '        Create a new controller and it\'s views.'
        ].join('\n');

        console.log(help);
    };

    if (opts.options.help || 0 === opts.argv.length) {
        return printHelp();
    }

    // Find a Greppy project recursivly
    var appPath = commandHelper.findProjectOrDie();

    // Setup the arguments to run
    var argument = argumentHelper.build(opts.argv);

    argument.setCommands({
        atomic: ['context', 'module', 'model', 'controller'],
    });

    // Build the operations chain
    var operations = argument.parse();

    var printHints = function() {

        var hints = [
            ' Usage hints'.yellow,
            '',
            '    To generate any scaffolds, we are going to ask you multiple',
            '    questions. You will always get hints and descriptions. Multiple questions',
            '    will have default values which appear in brackets ([]), so you just have',
            '    to press enter in case you don\'t want to change the value. Further you',
            '    can use auto-completion on selections with predefined values. Just press',
            '    the tab key.',
            '',
            '    Many generators end with an endless loop of a question set, if you\'re done',
            '    answering all the questions, just hit Ctrl+C to leave the question set.',
            ''
        ].join('\n');

        console.log(hints);
    };

    async.eachSeries(operations, function(operation, callback) {

        try {

            consoleApp.clear();

            (require('./scaffolding/' + operation.name)).run(
                operation.options,
                printHints,
                callback
            );

        } catch (e) {

            console.log(e.stack);
            callback && callback(e);
        }

    }, function(err) {

        if (err) {
            console.log(err);
            return;
        }
    });
};

