/**
 * Context helper
 *
 * @module greppy/cli/helper/context
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var helper = {};
var path = require('path');
var fs = require('fs');

helper.getContextsByArgs = function(contexts)
{
    var appPath = path.normalize(process.cwd() + '/');
    var registeredContexts = [];

    // Find all contexts
    var contextPath = appPath + 'app/context/';

    if (!fs.existsSync(contextPath)) {
        return false;
    }

    fs.readdirSync(contextPath).forEach(function(file) {

        if (!file.match(/\.js$/gi)) {
            return;
        }

        registeredContexts.push(path.basename(file, '.js'));
    });

    contexts.forEach(function(context) {

        if (-1 === registeredContexts.indexOf(context)) {
            console.log(new String('Context ' + context.green.bold + ' does not exist.').white);
            console.log();
            console.log(new String('Available contexts are: ' + registeredContexts.join(', ').green.bold).white);
            process.exit(1);
        }
    });

    if (0 === contexts.length) {
        contexts = registeredContexts;
    }

    return contexts;
}

module.exports = helper;

