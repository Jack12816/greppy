/**
 * Project Helper for testing
 *
 * @module greppy/helper/test/project
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var fs = require('fs');
var cp = require('child_process');

var Project = function(path)
{
    this.path        = path || process.cwd() + '/test/';
    this.folderName  = 'test-project';
    this.showOutput  = false;
};

Project.prototype.getFolderName = function()
{
    return this.folderName;
};

Project.prototype.getTargetPath = function()
{
    return this.path + this.folderName + '/';
};

Project.prototype.isExistent = function()
{
    return fs.existsSync(this.getTargetPath());
};

/**
 * Removes any old projects in the directory of the test-project.
 * TODO: Implement recursive deletion. Currently only empty folders will be deleted.
 * 
 * @returns {undefined}
 */
Project.prototype.removeOld = function()
{
    fs.rmdirSync(this.getTargetPath());
    // recursive deletion needs to be implemented here
};

/**
 * Initializes the directory for the test-project.
 * 
 * @returns {undefined}
 */
Project.prototype.initDir = function()
{
    if (this.isExistent()) {
        
        // recursive deletion needs to be implemented, so for now we just throw an error
        throw new Error('Recursive deletion is not yet implemented, please delete the old test-project folder manually!');
        //this.removeOld();
    }

    fs.mkdir(this.getTargetPath());
};

/**
 * Creates a project via the greppy binary, then calls the specified callback.
 * 
 * @param {Function} callback
 * @returns {undefined}
 */
Project.prototype.createProject = function(callback) {
    
    var ps = cp.spawn(__dirname + '/../../../bin/greppy', ['--new=.'], {cwd: this.getTargetPath()});

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

module.exports = Project;
