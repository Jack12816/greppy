/**
 * Project Helper for testing
 *
 * @module greppy/helper/test/project
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var fs            = require('fs');
var cp            = require('child_process');
var es            = require('execSync');
var greppyBinPath = __dirname + '/../../bin/greppy';

/**
 * @constructor
 */
var Project = function(path)
{
    this.path          = path || '/tmp/greppy-test/';
    this.directoryName = 'project';
    this.showOutput    = false;

    // Create the given path
    (require('node-fs')).mkdirSync(this.getTargetPath(), '0744', true);
};

/**
 * Get the name of the project directory.
 *
 * @returns {String}
 */
Project.prototype.getDirectoryName = function()
{
    return this.directoryName;
};

/**
 * Get the builded target path.
 *
 * @returns {String}
 */
Project.prototype.getTargetPath = function()
{
    return this.path + this.directoryName + '/';
};

/**
 * Checks if the current project got an existing target path.
 *
 * @returns {Boolean}
 */
Project.prototype.exists = function()
{
    return fs.existsSync(this.getTargetPath());
};

/**
 * Removes this project by its target path.
 *
 * @returns void
 */
Project.prototype.remove = function()
{
    es.run('rm -rf ' + this.getTargetPath());
};

/**
 * Removes all files from the project folder.
 *
 * @returns void
 */
Project.prototype.clean = function()
{
    es.run('rm -rf ' + this.getTargetPath());
    es.run('mkdir ' + this.getTargetPath());
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
        cwd: this.getTargetPath()
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

    process.chdir(this.getTargetPath());
    result = es[cmd](greppyBinPath + ' --new=.');
    result = (cmd === 'run') ? result : result.code;
    process.chdir(cwd);

    return result;
};

module.exports = Project;

