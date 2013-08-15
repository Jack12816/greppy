/**
 * List command
 *
 * @module greppy/cli/list
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var path   = require('path');
var colors = require('colors');
var Table  = require('tab');

exports.run = function(opts)
{
    var appPath  = path.normalize(process.cwd() + '/');

    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 32},
            {align: 'left'}
        ]
    });

    var contexts = [];

    // Find all contexts
    var contextsPath = appPath + 'app/context/';
    fs.readdirSync(contextsPath).forEach(function(file) {

        if (!file.match(/\.js$/gi)) {
            return;
        }

        contexts.push(path.basename(file, '.js'));
    });

    greppy = require('../../lib/greppy');

    // Start all contexts with the found start script
    contexts.forEach(function(context) {

        var context = new (require(contextsPath + context))();

        table.writeRow([
            context.name.bold.green,
            context.description.white
        ]);
    });
}

