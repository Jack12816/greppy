/**
 * Command Helper
 *
 * @module greppy/cli/helper/project
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var helper        = {};
var projectHelper = new (require('../../lib/helper/project.js'))();
var colors        = require('colors');

/**
 * Find a project in current working directory or die.
 *
 * @return {String}
 */
helper.findProjectOrDie = function()
{
    var result = projectHelper.findAppPath(process.cwd());

    if (false === result.found) {

        console.log(result.path.green.bold + ' is not a Greppy project or is located in one.');
        console.log();
        console.log('Searched for a Greppy project in this paths:');
        console.log();

        result.searched.forEach(function(path) {
            console.log('  ' + path);
        });

        process.exit(1);
        return;
    }

    // Change current working directory
    process.chdir(result.path);

    return result.path;
}

/**
 * Find a project in current working directory.
 *
 * @return {String}
 */
helper.findProject = function()
{
    var result = projectHelper.findAppPath(process.cwd());

    if (false === result.found) {
        return;
    }

    // Change current working directory
    process.chdir(result.path);

    return result.path;
}

/**
 * Check a given array of context names for existence.
 *
 * @param {Array} contexts - Contexts to check
 * @return {Array}
 */
helper.checkContexts = function(contexts)
{
    var appContexts = projectHelper.listContexts(process.cwd());

    if (0 === contexts.length) {
        return appContexts;
    }

    contexts.forEach(function(context) {

        if (-1 === appContexts.contexts.indexOf(context)) {

            console.log(
                new String('Context ' + context.green.bold
                    + ' does not exist.').white
            );
            console.log();
            console.log(
                new String('Available contexts are: '
                    + appContexts.contexts.join(', ').green.bold).white
            );
            process.exit(1);
            return;
        }
    });

    return {
        path     : appContexts.path,
        contexts : contexts
    };
}

/**
 * Check a given array of module names for existence.
 *
 * @param {Array} modules - Modules to check
 * @return {Array}
 */
helper.checkModules = function(modules)
{
    var appModules = projectHelper.listModules(process.cwd());

    if (0 === modules.length) {
        return appModules;
    }

    modules.forEach(function(module) {

        if (-1 === appModules.modules.indexOf(module)) {

            console.log(
                new String('Module ' + module.green.bold
                    + ' does not exist.').white
            );
            console.log();
            console.log(
                new String('Available modules are: '
                    + appModules.modules.join(', ').green.bold).white
            );
            process.exit(1);
            return;
        }
    });

    return {
        path    : appModules.path,
        modules : modules
    };
}

/**
 * Get all database configurations.
 *
 * @return {Object}
 */
helper.getDatabaseConfigs = function()
{
    var configs = projectHelper.loadConfigs(
        projectHelper.listConfigs(process.cwd())
    );

    var dbConfigs = {
        path       : configs.path,
        configs    : [],
        instance   : {},
        namespaces : []
    };

    configs.configs.forEach(function(config) {

        var conf = configs.instance[config];

        if (conf.hasOwnProperty('database')) {
            dbConfigs.configs.push(config);
            dbConfigs.instance[config] = conf.database;

            Object.keys(conf.database).forEach(function(backend) {

                Object.keys(conf.database[backend]).forEach(function(connection) {

                    dbConfigs.namespaces.push(
                        backend + '.' + connection
                    );
                });
            });
        }
    });

    if (0 === dbConfigs.configs.length) {

        console.log('No database configuration found.')
        process.exit(1);
        return;
    }

    return dbConfigs;
}

/**
 * Check the given namespaces against the configurations found
 * for the current application.
 *
 * @param {Array} namespaces - Namespaces to check
 * @return {Array}
 */
helper.checkDatabaseNamespace = function(namespaces)
{
    var dbConfigs = helper.getDatabaseConfigs();

    if (0 === namespaces.length) {
        return dbConfigs.namespaces;
    }

    namespaces.forEach(function(namespace) {

        var conf = helper.getDatabaseConfigByNamespace(namespace, dbConfigs);

        if (false === conf) {

            console.log(
                new String('Namespace ' + namespace.green.bold
                    + ' does not exist.').white
            );
            console.log();
            console.log(
                new String('Available namespaces are: '
                    + dbConfigs.namespaces.join(', ').green.bold).white
            );
            process.exit(1);
            return;
        }
    });

    return namespaces;
}

/**
 * Get a database connection configuration by it's namespace.
 *
 * @param {String} namespace - Namespace to search
 * @param {Object} configs - Databases configuration Object
 * @return {Object}
 */
helper.getDatabaseConfigByNamespace = function(namespace, configs)
{
    var path       = namespace.split('.');
    var backend    = path.shift();
    var connection = path.join('.');
    var result     = false;

    if (!backend || !connection) {
        return result;
    }

    configs.configs.some(function(configSource) {

        config = configs.instance[configSource];

        if (config.hasOwnProperty(backend)) {

            if (config[backend].hasOwnProperty(connection)) {

                result            = config[backend][connection];
                result.backend    = backend;
                result.connection = connection;
                result.source     = configSource;
                return true;
            }
        }
    });

    return result;
}

/**
 * Check the running state of a context and print information about it
 * if nessecary.
 *
 * @param {Object} state - Context state object
 * @return {Boolean}
 */
helper.checkForRunningContextState = function(state)
{
    if (true === state.running) {

        global.table.writeRow([
            'start'.bold.green,
            new String(state.name + ' -- already running (' + state.pid + ')').white
        ]);

        return true;
    }

    return false;
}

/**
 * Check the running state of a context and print information about it
 * if nessecary.
 *
 * @param {Object} state - Context state object
 * @return {Boolean}
 */
helper.checkForStoppedContextState = function(state)
{
    if (false === state.running) {

        global.table.writeRow([
            'stop'.bold.green,
            new String(state.name + ' -- already stopped').white
        ]);

        return true;
    }

    return false;
}

/**
 * Formatting a given dialog based result array.
 *
 * @param {Array} results - Dialog generated results
 * @return {Object}
 */
helper.dialogResultsFormat = function(results)
{
    var res = {};

    results.forEach(function(result) {
        res[result.id] = result.result;
    });

    return res;
}

/**
 * Generate files by configuration.
 *
 * @param {Object} fileConfigs - Configuration for all file generations
 * @param {Object} results - Results to use with mustache
 * @param {Boolean} [clear] - Clear the terminal - Default true
 * @return void
 */
helper.generateScaffoldsByConfig = function(fileConfigs, results, clear)
{
    if (undefined === clear || true === clear) {
        consoleApp.clear();
        console.log();
    }

    // Generate the files
    fileConfigs.forEach(function(config) {

        // Try to build the path, on error it just exists
        try {
            (require('node-fs')).mkdirSync(config.path, '0744', true);
        } catch (e) {
        }

        fs.writeFileSync(
            config.path + config.name,
            (require('mustache')).render(fs.readFileSync(config.template, 'utf8'), results)
        );

        global.table.writeRow([
            'generate '.bold.green,
            new String(config.path + config.name).replace(process.cwd() + '/', '').white
        ]);
    });
}

/**
 * Get the identity of the current user.
 *
 * @param {Function} callback - Function to call on finish
 * @return void
 */
helper.getCurrentUser = function(callback)
{
    var gitHelper  = new (require('../../lib/helper/vcs/git'))();
    var getUserStr = undefined;
    var defaultStr = process.env.USER + '@' + process.env.HOSTNAME;

    if (gitHelper.isRepository(process.cwd())) {

        getUserStr = function(callback) {

            gitHelper.getGlobalUser(function(err, identity) {

                if (err || !identity) {
                    return callback && callback(null, defaultStr);
                }

                var str = undefined;

                if (identity.name) {
                    str = identity.name;
                }

                if (identity.email) {
                    if (!str) {
                        str = identity.email;
                    } else {
                        str += ' <' + identity.email + '>';
                    }
                }

                callback && callback(null, str);
            });
        };

    } else {

        getUserStr = function(callback) {
            callback && callback(null, defaultStr);
        }
    }

    getUserStr(callback);
}

/**
 * Create directories by an given array.
 *
 * @param {Array} paths - Array of path strings (absolute|relative)
 * @param {Boolean} [clear] - Clear the terminal - Default true
 * @return void
 */
helper.generateScaffoldPaths = function(paths, clear)
{
    if (undefined === clear || true === clear) {
        consoleApp.clear();
        console.log();
    }

    // Generate the files
    paths.forEach(function(path) {

        // Try to build the path, on error it just exists
        try {
            (require('node-fs')).mkdirSync(path, '0744', true);
        } catch (e) {
        }

        global.table.writeRow([
            'create '.bold.green,
            new String(path).replace(process.cwd() + '/', '').white
        ]);
    });
}

module.exports = helper;

