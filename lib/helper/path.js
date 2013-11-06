/**
 * Path Helper
 *
 * @module greppy/helper/path
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util = require('util');
var fs = require('fs');
var path = require('path');

/**
 * @constructor
 */
var Path = function()
{
};

/**
 * Recursivly list all files and/or directories for given start point(s).
 *
 * @param {Array|String} startPoints - Startpoint to search, or multiple
 * @param {Object} options - Options for listing dirs and/or files
 * @return {Array}
 */
Path.prototype.list = function(startPoints, options)
{
    if (!startPoints) {
        throw new Error('No startPoint(s) was given');
    }

    var self = this;

    if (!util.isArray(startPoints)) {
        startPoints = [startPoints];
    }

    options             = options || {};
    options.directories = ('undefined' === typeof options.directories) ? false : options.directories;
    options.files       = ('undefined' === typeof options.files) ? true : options.files;

    var dirs = [];

    if (options.directories) {
        dirs = startPoints;
    }

    startPoints.forEach(function(start) {

        var stat = fs.statSync(start);

        if (stat.isDirectory()) {

            var filenames = fs.readdirSync(start);

            filenames.forEach(function(name) {

                var abspath     = path.join(start, name);
                var abspathStat = fs.statSync(abspath);

                if (abspathStat.isDirectory()) {

                    if (options.directories) {
                        dirs.push(abspath);
                    }

                    rDirs = self.list([abspath], options);

                    if (rDirs instanceof Array) {

                        rDirs.forEach(function(dir) {
                            -1 == dirs.indexOf(dir) && dirs.push(dir);
                        });

                    } else {
                        -1 == dirs.indexOf(dir) && dirs.push(rDirs);
                    }

                    return;
                }

                if (abspathStat.isFile() && options.files) {
                    dirs.push(abspath);
                }
            });

        } else {
            throw new Error("Path " + start + " is not a directory");
        }
    });

    return dirs;
};

module.exports = Path;

