/**
 * New Command
 *
 * @module greppy/cli/new
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var async  = require('async');
var helper = {};

/**
 * Check binary dependencies.
 *
 * @param {Function} callback - Function to call on finish
 */
helper.checkBinaryDependencies = function(callback)
{
    var binaries = [
        {
            command: 'npm',
            onError: 'warning',
            isAvailable: true
        },
        {
            command: 'bower --allow-root',
            onError: 'warning',
            isAvailable: true
        },
        {
            command: 'greppy',
            onError: 'warning',
            isAvailable: true
        }
    ];

    var result = {};

    async.each(binaries, function(binary, callback) {

        // Test the binary
        childProcess.exec(binary.command, function(err, stdout, stderr) {

            if (err && 0 !== err.code) {
                binary.isAvailable = false;

                if ('fatal' === binary.onError) {
                    return callback && callback(new Error('BINARY_NOT_WORKING'));
                }
            }

            result[binary.command.split(' ')[0]] = binary;
            callback && callback();
        });

    }, function(err) {

        if (err) {

            if ('BINARY_NOT_WORKING' === err.message) {
                console.log('npm is not installed or doesn\'t work properly.'.red.bold);
                return process.exit(1);
            }

            console.log(err.message.red.bold);
            return process.exit(1);
        }

        callback && callback(null, result);
    });
};

/**
 * Run the recipe to create a new project structure.
 *
 * @param {String} path - Path where we should create a new project
 * @param {Function} callback - Function to call on finish
 */
helper.createProjectStructure = function(path, callback)
{
    var structure = pathHelper.list([__dirname + '/../../templates/project'], {
        files       : false,
        directories : true
    });

    structure.shift();

    var files = pathHelper.list([__dirname + '/../../templates/project'], {
        files       : true,
        directories : false
    });

    // Create project path
    try { fs.mkdirSync(path); } catch (e) {}

    // Create the project structure
    structure.forEach(function(directory) {
        directory = path + directory.replace(
            (require('path')).normalize(__dirname + '/../../templates/project'), ''
        );
        global.table.writeRow(['create '.bold.green, directory.replace(path + '/', '')]);
        fs.mkdirSync(directory);
    });

    // Copy over files to the empty project structure
    files.forEach(function(file) {

        if (file.match(/\.npmignore$|\.gitignore$/gi)) {
            return;
        }

        var fileDest = path + file.replace(
            (require('path')).normalize(__dirname + '/../../templates/project'), ''
        );

        if (file.match(/\.greppyignore/gi)) {
            fileDest = fileDest.replace(/\.greppyignore/gi, '.gitignore');
        }

        global.table.writeRow(['create '.bold.green, fileDest.replace(path + '/', '')]);
        fs.createReadStream(file).pipe(fs.createWriteStream(fileDest));
    });

    callback && callback();
};

/**
 * Run a specific command.
 *
 * @param {Object} binary - Binary object to use
 * @param {String} path - Path where we should bootstrap a new project
 * @param {String} skipText - Text to print for skipped commands
 * @param {Function} callback - Function to call on finish
 */
helper.runCommand = function(binary, path, skipText, callback)
{
    if (false === binary.isAvailable) {

        global.table.writeRow([
            'skip '.bold.yellow,
            binary.command + (' | Info: ' + skipText).grey
        ]);

        return callback && callback();
    }

    global.table.writeRow(['run '.bold.green, binary.command]);
    childProcess.exec(binary.command, {cwd: path}, function(err, stdout, stderr) {

        if (err) {
            global.table.writeRow(['error '.bold.red, err]);
        }

        callback && callback();
    });
};

/**
 * Run the recipe to bootstrap a new project.
 *
 * @param {String} path - Path where we should bootstrap a new project
 * @param {Array} binaries - Array of binaries we can use
 * @param {Function} callback - Function to call on finish
 */
helper.bootstrapProject = function(path, binaries, callback)
{
    async.parallel([

        // Run npm to install all dependencies
        function(callback) {

            var binary = binaries.npm;
            binary.command += ' install';

            helper.runCommand(
                binary, path,
                'npm binary is not ready to use, fix this and retry ' +
                'installation of dependencies manually'.grey,
                callback
            );
        },

        // Run bower to install all frontend dependencies
        function(callback) {

            var binary = binaries.bower;
            binary.command += ' install';

            helper.runCommand(
                binary, path,
                'bower binary is not ready to use, fix this (npm install -g bower)  and retry ' +
                'installation of frontend dependencies manually'.grey,
                callback
            );
        },

        // Run greppy assets install to link up all modules
        function(callback) {

            var binary = binaries.greppy;
            binary.command += ' --assets install';

            helper.runCommand(
                binary, path,
                'greppy binary is not ready to use, fix this (npm install -g greppy) and retry ' +
                'installation of frontend assets'.grey,
                callback
            );
        }

    ], callback);
};

/**
 * Run the create new project command.
 *
 * @param {Object} opts - Binary given options object
 */
exports.run = function(opts)
{
    var projectName = opts.argv.shift();

    if (!projectName) {
        console.log('No project name was specified.'.red.bold);
        return process.exit(1);
    }

    var appPath = path.normalize(
        process.cwd() + '/' + projectName
    );

    if (fs.existsSync(appPath)) {

        if (0 !== fs.readdirSync(appPath).length) {
            console.log('\nThe application directory already exists and contains files.'.red.bold);
            return process.exit(1);
        }
    }

    async.waterfall([

        // First check the available binaries
        helper.checkBinaryDependencies,

        // Create the project structure
        function(binaries, callback) {
            helper.createProjectStructure(appPath, function(err) {
                callback && callback(err, binaries);
            });
        },

        // Run bootstraping
        function(binaries, callback) {
            helper.bootstrapProject(appPath, binaries, callback);
        }

    ], function(err) {

        if (err) {
            console.log(err.message.red.bold);
            return process.exit(1);
        }

        process.exit(0);
    });
};

