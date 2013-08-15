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

exports.run = function(opts)
{
    var appPath = path.normalize(
        process.cwd() + '/' + opts.options.new
    );

    var directories = [
        '',
        'app',
        'app/config',
        'app/context',
        'bin',
        'database',
        'database/fixtures',
        'database/migrations',
        'docs',
        'modules',
        'public',
        'public/css',
        'public/js',
        'public/img',
        'tests',
        'var',
        'var/log',
        'var/run'
    ];

    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 32},
            {align: 'left'}
        ]
    });

    directories.forEach(function(directory) {
        table.writeRow(['create '.bold.green, directory]);
        fs.mkdirSync(path.normalize(
            appPath + '/' + directory
        ));
    });

    process.chdir(appPath);

    var files = [
        {
            path: 'CHANGELOG.md',
            content: 'Version 0.1.0\n'
                + '=============\n\n'
        },
        {
            path: 'README.md',
            content: '# Project\n\n'
        },
        {
            path: 'package.json',
            content: '{\n'
                + '    "name"         : "project",\n'
                + '    "description"  : "",\n'
                + '    "version"      : "0.1.0",\n'
                + '    "private"      : true,\n'
                + '    "author"       : "Name <Mail> (Website)",\n'
                + '    "contributors" : [\n'
                + '        {\n'
                + '            "name"  : "",\n'
                + '            "email" : ""\n'
                + '        }\n'
                + '    ],\n'
                + '    "dependencies" : {\n'
                + '        "express"           : "3.x",\n'
                + '        "greppy"            : "~0.1.0",\n'
                + '        "jade"              : "~0.31.2",\n'
                + '        "async"             : "~0.2.5",\n'
                + '        "moment"            : "~2.0.0",\n'
                + '        "validator"         : "~1.2.1",\n'
                + '        "express-validator" : "~0.3.2",\n'
                + '        "winston"           : "~0.7.2",\n'
                + '        "express-winston"   : "~0.2.0"\n'
                + '    }\n'
                + '}\n'
        }
    ];

    files.forEach(function(file) {
        table.writeRow(['create '.bold.green, file.path]);
        fs.writeFileSync(
            path.normalize(appPath + '/' + file.path),
            file.content
        );
    });

    table.writeRow(['run '.bold.green, 'npm install']);
    childProcess.exec('npm install', function(err, stdout, stderr) {

        if (err) {
            table.writeRow(['error '.bold.red, err]);
        }
    });
}

