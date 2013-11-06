/**
 * Project Helper
 *
 * @module greppy/helper/project
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util = require('util');
var fs   = require('fs');

/**
 * @constructor
 */
var Project = function()
{
};

/**
 * Find a greppy project by path.
 *
 * @param {String} path - Path to start looking
 * @return {Object}
 */
Project.prototype.findAppPath = function(path, searched)
{
    path         = (require('path')).normalize(path + '/');
    var greppyrc = (require('path')).normalize(path + '/.greppyrc');

    if (!searched) {
        searched = [];
    }

    searched.push(path);

    if (!fs.existsSync(greppyrc)) {

        if ('/' === path) {

            return {
                found    : false,
                path     : searched[0],
                searched : searched
            };
        }

        return this.findAppPath(
            path + '/../', searched
        );
    }

    return {
        found    : true,
        path     : path,
        searched : searched
    };
};

/**
 * List all context of an application path.
 *
 * @param {String} path - Path to look for contexts
 * @return {Object}
 */
Project.prototype.listContexts = function(path)
{
    var contextPath = (require('path')).normalize(path + '/app/context/');
    var contexts    = [];

    if (!fs.existsSync(contextPath)) {
        return {
            path     : contextPath,
            contexts : contexts
        };
    }

    fs.readdirSync(contextPath).forEach(function(file) {

        if (!file.match(/\.js$/gi)) {
            return;
        }

        contexts.push((require('path')).basename(file, '.js'));
    });

    return {
        path     : contextPath,
        contexts : contexts
    };
};

/**
 * List all modules of an application path.
 *
 * @param {String} path - Path to look for modules
 * @return {Object}
 */
Project.prototype.listModules = function(path)
{
    var modulePath = (require('path')).normalize(path + '/modules/');
    var modules    = [];

    if (!fs.existsSync(modulePath) || !fs.statSync(modulePath).isDirectory()) {
        return {
            path    : modulePath,
            modules : modules
        };
    }

    fs.readdirSync(modulePath).forEach(function(file) {

        if (!fs.statSync(modulePath + file).isDirectory()) {
            return;
        }

        modules.push(file);
    });

    return {
        path    : modulePath,
        modules : modules
    };
};

/**
 * Load the contexts instances for a given context object
 * which was build by ``listContexts``.
 *
 * @param {Object} contextObject - Contexts Object
 * @return {Object}
 */
Project.prototype.loadContexts = function(contextObject)
{
    var greppy = require('../greppy.js');
    contextObject.instance = {};

    contextObject.contexts.forEach(function(context) {

        try {
            contextObject.instance[context] = new (require(contextObject.path + context))();
        } catch (e) {
        }

    });

    return contextObject;
};

/**
 * Search the start script of a greppy application.
 *
 * @param {String} path - Path to search in
 * @return {String|Boolean}
 */
Project.prototype.findStartScript = function(path)
{
    var appPath = (require('path')).normalize(path + '/app/');
    var startScript = 'worker.js';

    if (!fs.existsSync(appPath) || !fs.statSync(appPath).isDirectory()) {
        return false;
    }

    fs.readdirSync(appPath).some(function(file) {

        if (file.match(/master/gi) && file.match(/\.js$/gi)) {
            startScript = file;
            return true;
        }
    });

    if (fs.existsSync(appPath + startScript)) {
        return appPath + startScript;
    }

    return false;
};

/**
 * List all configurations of an application path.
 *
 * @param {String} path - Path to look for configurations
 * @return {Object}
 */
Project.prototype.listConfigs = function(path)
{
    var configPath = (require('path')).normalize(path + '/app/config/');
    var configs    = [];

    if (!fs.existsSync(configPath) || !fs.statSync(configPath).isDirectory()) {
        return {
            path    : configPath,
            configs : configs
        };
    }

    fs.readdirSync(configPath).forEach(function(file) {

        if (!file.match(/\.js$|\.json$/gi)) {
            return;
        }

        configs.push((require('path')).basename(file, '.js'));
    });

    return {
        path    : configPath,
        configs : configs
    };
};

/**
 * Load the configuration instances for a given config object
 * which was build by ``listConfigs``.
 *
 * @param {Object} configObject - Configuration Object
 * @return {Object}
 */
Project.prototype.loadConfigs = function(configObject)
{
    configObject.instance = {};

    configObject.configs.forEach(function(config) {

        try {
            configObject.instance[config] = require(configObject.path + config);
        } catch (e) {
        }

    });

    return configObject;
};

/**
 * List all models of a given module path.
 *
 * @param {String} path - Path to look for models
 * @param {Boolean} [listAssociations] - List associations - Default: false
 * @return {Object}
 */
Project.prototype.listModels = function(path, listAssociations)
{
    var models = {};

    if ('undefined' === typeof listAssociations) {
        listAssociations = false;
    }

    var modelPath = (require('path')).normalize(
        path + '/models/'
    );

    if (!fs.existsSync(modelPath) || !fs.statSync(modelPath).isDirectory()) {
        return;
    }

    fs.readdirSync(modelPath).forEach(function(namespace) {

        if (!fs.statSync(modelPath + namespace).isDirectory()) {
            return;
        }

        if (!models[namespace]) {
            models[namespace] = [];
        }

        fs.readdirSync(modelPath + namespace).forEach(function(file) {

            if (!file.match(/\.js$/gi) ||
                (false === listAssociations && null !== file.match(/^Associations\.js$/))) {
                return;
            }

            models[namespace].push((require('path')).basename(file, '.js'));
        });
    });

    return models;
};

/**
 * List all models of all modules of an application path.
 *
 * @param {String} path - Path to look for configurations
 * @param {Boolean} [listAssociations] - List associations - Default: false
 * @return {Object}
 */
Project.prototype.listModelsForAllModules = function(path, listAssociations)
{
    var self    = this;
    var modules = this.listModules(path);
    var results = {};

    modules.modules.forEach(function(module) {

        var modelPath = (require('path')).normalize(
            modules.path + module
        );

        var result = self.listModels(modelPath, listAssociations);

        if (!result) {
            return;
        }

        results[module] = result;
    });

    return results;
};

/**
 * List all fixtures for a connection.
 *
 * @param {String} path - Path to look for fixtures
 * @param {String} connection - Name of the connection
 * @return {Object}
 */
Project.prototype.listFixturesForConnection = function(path, connection)
{
    var fixturesPath = (require('path')).normalize(
        path + '/database/fixtures/' + connection + '/'
    );
    var fixtures = [];
    var basename = require('path').basename;

    if (!fs.existsSync(fixturesPath) || !fs.statSync(fixturesPath).isDirectory()) {
        return {
            path    : fixturesPath,
            configs : fixtures
        };
    }

    fs.readdirSync(fixturesPath).forEach(function(file) {

        if (!file.match(/\.js$/gi)) {
            return;
        }

        fixtures.push(basename(file, '.js'));
    });

    return {
        path     : fixturesPath,
        fixtures : fixtures
    };
};

/**
 * List all fixtures for a connection.
 *
 * @param {String} path - Path to look for fixtures
 * @param {String} connection - Name of the connection
 * @return {Object}
 */
Project.prototype.listMigrationsForConnection = function(path, connection)
{
    var migrationsPath = (require('path')).normalize(
        path + '/database/migrations/' + connection + '/'
    );
    var migrations = [];
    var basename = require('path').basename;

    if (!fs.existsSync(migrationsPath) || !fs.statSync(migrationsPath).isDirectory()) {
        return {
            path    : migrationsPath,
            configs : migrations
        };
    }

    fs.readdirSync(migrationsPath).forEach(function(file) {

        if (!file.match(/\.js$/gi)) {
            return;
        }

        migrations.push(basename(file, '.js'));
    });

    return {
        path     : migrationsPath,
        migrations : migrations
    };
};

/**
 * Format all routes of an given context.
 *
 * @param {Object} context - Context were we format routes
 * @return {Array}
 */
Project.prototype.formatContextRoutes = function(context)
{
    var routes = [];

    if (context.routes) {

        var maxPathLength = 0;
        var maxMethodLength = 0;

        context.routes.forEach(function(route) {

            maxPathLength = (route.path.length > maxPathLength)
                ? route.path.length
                : maxPathLength;

            maxMethodLength = (route.method.length > maxMethodLength)
                ? route.method.length
                : maxMethodLength;
        });

        context.routes.forEach(function(route) {

            while (maxMethodLength > route.method.length) {
                route.method = ' ' + route.method;
            }

            while (maxPathLength > route.path.length) {
                route.path += ' ';
            }

            routes.push(
                '[' + route.method.green.bold + '] ' +
                '[' + (null === route.auth ? '+'.green.bold : '-'.red.bold) + '] ' +
                route.path +
                ' -> ' + route.module.blue +
                '::' + route.controllerPath.red +
                '::' + route.action.yellow
            );
        });
    }

    return routes;
};

module.exports = Project;

