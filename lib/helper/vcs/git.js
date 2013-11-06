/**
 * VCS Git Helper
 *
 * @module greppy/helper/vcs/git
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs = require('fs');

/**
 * @constructor
 */
var Git = function()
{
};

/**
 * Check if the given directory is a git repository.
 *
 * @param {String} path - Path to check
 * @return {Boolean}
 */
Git.prototype.isRepository = function(path)
{
    path = (require('path')).normalize(path + '/.git');

    if (!fs.existsSync(path)) {
        return false;
    }

    if (!fs.statSync(path).isDirectory()) {
        return false;
    }

    return true;
};

/**
 * Try to get information about the last commit of a path.
 *
 * @param {String} path - Path to check
 * @param {Function} callback - Function to call on finish
 */
Git.prototype.getLastCommit = function(path, callback)
{
    if (!this.isRepository(path)) {
        return callback && callback(new Error(path + ' is not a git repository'));
    }

    var command = 'git log --pretty="%h|%cn|%ce|%ci|%cr" -n1 HEAD';

    (require('child_process')).exec(command, {cwd: path}, function(err, stdout, stderr) {

        if (err || stderr) {
            return callback && callback({err: err, stderr: stderr});
        }

        var info = stdout.replace('\n', '').split('|');

        callback && callback(null, {
            hash    : info[0],
            author  : info[1],
            email   : info[2],
            date    : info[3],
            timeAgo : info[4]
        });
    });
};

/**
 * Get the global author information.
 *
 * @param {String} path - Path to check
 * @param {Function} callback - Function to call on finish
 */
Git.prototype.getGlobalUser = function(callback)
{
    var command = 'git config --global --get-regexp ^user';

    (require('child_process')).exec(command, {cwd: path}, function(err, stdout, stderr) {

        if (err || stderr) {
            return callback && callback({err: err, stderr: stderr});
        }

        var lines = stdout.split('\n');
        var result = {};

        lines.forEach(function(line) {

            if (-1 !== line.indexOf('user.email')) {
                result.email = line.replace('user.email ', '');
            }

            if (-1 !== line.indexOf('user.name')) {
                result.name = line.replace('user.name ', '');
            }
        });

        callback && callback(null, result);
    });
};

module.exports = Git;

