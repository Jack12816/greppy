/**
 * Project Helper for testing
 *
 * @module greppy/helper/test/project
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var fs            = require('fs');
var cp            = require('child_process');
var es            = require('execSync');
var path          = require('path');
var root          = path.resolve(__dirname + '/../../');
var paths         = require(root + '/tests/paths');
var greppyBinPath = root + '/bin/greppy';

/**
 * @constructor
 *
 * @param {String} [path] The path used for creating the project
 */
var Project = function(path)
{
    this.path          = path || paths.temp + '/test-project/';
    this.showOutput    = false;

    // Create the given path
    (require('node-fs')).mkdirSync(this.getPath(), '0744', true);
};

/**
 * Get the builded target path.
 *
 * @returns {String}
 */
Project.prototype.getPath = function()
{
    return path.resolve(this.path) + '/';
};

/**
 * Checks if the current project got an existing target path.
 *
 * @returns {Boolean}
 */
Project.prototype.exists = function()
{
    return fs.existsSync(this.getPath());
};

/**
 * Removes this project by its target path.
 *
 * @returns void
 */
Project.prototype.remove = function()
{
    es.run('rm -rf ' + this.getPath());
};

/**
 * Removes all files from the project folder.
 *
 * @returns void
 */
Project.prototype.clean = function()
{
    es.run('rm -rf ' + this.getPath());
    es.run('mkdir ' + this.getPath());
};

/**
 * Creates a project via the greppy binary, then calls
 * the specified callback.
 *
 * @param {Function} callback
 * @returns {undefined}
 */
Project.prototype.createProject = function(callback)
{
    if (this.exists()) {
        this.clean();
    }

    var ps = cp.spawn(greppyBinPath, ['--new=.'], {
        cwd: this.getPath()
    });

    if (this.showOutput) {

        console.log();

        ps.stdout.on('data', function(data) {
            process.stdout.write(data.toString());
        });
    }

    ps.on('close', function(code) {
        callback && callback(code);
    });
};

/**
 * Creates a project via the greppy binary synchronously.
 *
 * @returns {Int} exitCode
 */
Project.prototype.createProjectSync = function()
{
    if (this.exists()) {
        this.clean();
    }

    var cmd = this.showOutput ? 'run' : 'exec';
    var cwd = process.cwd();
    var result;

    process.chdir(this.getPath());
    result = es[cmd](greppyBinPath + ' --new=.');
    result = (cmd === 'run') ? result : result.code;
    process.chdir(cwd);

    return result;
};

module.exports = Project;

