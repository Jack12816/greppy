/**
 * New Command
 *
 * @module greppy/cli/new
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(opts)
{
    var appPath = path.normalize(
        process.cwd() + '/' + opts.options.new
    );

    var createProject = function()
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

        try {

            // Create project path
            fs.mkdirSync(appPath);

        } catch (e) {}

        structure.forEach(function(directory) {
            directory = appPath + directory.replace(path.normalize(__dirname + '/../../templates/project'), '');
            global.table.writeRow(['create '.bold.green, directory.replace(appPath + '/', '')]);
            fs.mkdirSync(directory);
        });

        files.forEach(function(file) {

            if (file.match(/\.gitkeep$/gi)) {
                return;
            }

            var fileDest = appPath + file.replace(path.normalize(__dirname + '/../../templates/project'), '');
            global.table.writeRow(['create '.bold.green, fileDest.replace(appPath + '/', '')]);
            fs.createReadStream(file).pipe(fs.createWriteStream(fileDest));
        });

        global.table.writeRow(['run '.bold.green, 'npm install']);
        childProcess.exec('npm install', {cwd: appPath}, function(err, stdout, stderr) {

            if (err) {
                global.table.writeRow(['error '.bold.red, err]);
            }
        });

        global.table.writeRow(['run '.bold.green, 'bower install']);
        childProcess.exec('bower install --allow-root', {cwd: appPath}, function(err, stdout, stderr) {

            if (err) {
                global.table.writeRow(['error '.bold.red, err]);
            }
        });

        global.table.writeRow(['run '.bold.green, 'greppy --assets install']);
        childProcess.exec('greppy --assets install', {cwd: appPath}, function(err, stdout, stderr) {

            if (err) {
                global.table.writeRow(['error '.bold.red, err]);
            }
        });
    }

    childProcess.exec('npm', function(err, stdout, stderr) {

        if (err && 0 !== err.code) {
            console.log('npm is not installed or doesn\'t work properly.'.red.bold);
            process.exit(1);
            return;
        }

        childProcess.exec('bower --allow-root', function(err, stdout, stderr) {

            if (err && 0 !== err.code) {
                console.log('bower is not installed or doesn\'t work properly.'.red.bold);
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

