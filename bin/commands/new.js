/**
 * New command
 *
 * @module greppy/cli/new
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs           = require('fs');
var path         = require('path');
var colors       = require('colors')
var childProcess = require('child_process');
var Table        = require('tab');
var pathHelper   = new (require('../../lib/helper/path'))();

exports.run = function(opts)
{
    var appPath = path.normalize(
        process.cwd() + '/' + opts.options.new
    );

    var createProject = function()
    {
        var table = new Table.TableOutputStream({
            omitHeader: true,
            columns: [
                {align: 'right', width: 32},
                {align: 'left'}
            ]
        });

        var structure = pathHelper.list([__dirname + '/../../templates/project'], {
            files       : false,
            directories : true
        });

        structure.shift();

        var files = pathHelper.list([__dirname + '/../../templates/project'], {
            files       : true,
            directories : false
        });

        try {

            // Create project path
            fs.mkdirSync(appPath);

        } catch (e) {}

        structure.forEach(function(directory) {
            directory = appPath + directory.replace(path.normalize(__dirname + '/../../templates/project'), '');
            table.writeRow(['create '.bold.green, directory.replace(appPath + '/', '')]);
            fs.mkdirSync(directory);
        });

        files.forEach(function(file) {

            if (file.match(/\.gitkeep$/gi)) {
                return;
            }

            var fileDest = appPath + file.replace(path.normalize(__dirname + '/../../templates/project'), '');
            table.writeRow(['create '.bold.green, fileDest.replace(appPath + '/', '')]);
            fs.createReadStream(file).pipe(fs.createWriteStream(fileDest));
        });

        table.writeRow(['run '.bold.green, 'npm install']);
        childProcess.exec('npm install', {cwd: appPath}, function(err, stdout, stderr) {

            if (err) {
                table.writeRow(['error '.bold.red, err]);
            }
        });

        table.writeRow(['run '.bold.green, 'bower install']);
        childProcess.exec('bower install', {cwd: appPath}, function(err, stdout, stderr) {

            if (err) {
                table.writeRow(['error '.bold.red, err]);
            }
        });
    }

    childProcess.exec('npm', function(err, stdout, stderr) {

        if (err && 0 !== err.code) {
            console.log('npm is not installed or dont work properly.'.red.bold);
            process.exit(1);
            return;
        }

        childProcess.exec('bower', function(err, stdout, stderr) {

            if (err && 0 !== err.code) {
                console.log('bower is not installed or dont work properly.'.red.bold);
                console.log('\nTo install bower run: npm install -g bower');
                process.exit(1);
                return;
            }

            if (fs.existsSync(appPath)) {

                if (0 !== fs.readdirSync(appPath).length) {
                    console.log('\nThe application directory already exists and contains files.'.red.bold);
                    process.exit(1);
                    return;
                }
            }

            createProject();
        });
    });
}

