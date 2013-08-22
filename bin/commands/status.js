/**
 * Status command
 *
 * @module greppy/cli/status
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var path   = require('path');
var colors = require('colors');
var Table  = require('tab');

exports.run = function(opts)
{
    var appPath  = path.normalize(process.cwd() + '/');

    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 32},
            {align: 'left'}
        ]
    });

    var contexts = [];

    if (!fs.existsSync(appPath + 'app/context/')) {
        console.log(appPath.green.bold + ' is not a Greppy project.');
        process.exit(1);
        return;
    }

    // Find all contexts
    fs.readdirSync(appPath + 'app/context/').forEach(function(file) {

        if (!file.match(/\.js$/gi)) {
            return;
        }

        contexts.push(path.basename(file, '.js'));
    });

    // Start all contexts with the found start script
    contexts.forEach(function(context) {

        var running = false;
        var pidFile = appPath + 'var/run/' + context + '.pid';

        if (fs.existsSync(pidFile)) {

            var existingPid = fs.readFileSync(pidFile, 'utf8');

            if (fs.existsSync('/proc/' + existingPid + '/status')) {
                running = true;
            }
        }

        if (!running) {

            table.writeRow([
                context.bold.green,
                new String(
                    'is not running'.red.bold
                ).white
            ]);

            return;
        }

        // Calc memory usage
        var pids = helper.findChilds(existingPid);
        pids.push(existingPid);

        var memory = helper.getMemoryUsage(pids);

        table.writeRow([
            context.bold.green,
            new String(
                'context is running '.green
                + '(' + existingPid + ')'
            ).white
        ]);

        memory.forEach(function(res) {

            table.writeRow([
                new String( res.pid || 'total' ).white.bold,
                new String(
                    ((res.pid) ? 'used ' : '') + res.usage
                ).white
            ]);
        });
        console.log();
    });
}

var helper = {};

helper.findChilds = function(pid)
{
    var childs = [];

    fs.readdirSync('/proc').forEach(function(proc) {

        if (!proc.match(/^[0-9]*$/) && pid != proc) {
            return;
        }

        if (!fs.existsSync('/proc/' + proc + '/stat')) {
            return;
        }

        var stat = fs.readFileSync('/proc/' + proc + '/stat', 'ascii');
        var parent = stat.split(' ')[3];

        if (pid == parent) {
            childs.push(proc);
        }
    });

    return childs;
};

helper.getMemoryUsage = function(pids)
{
    var results = [];
    var total   = 0;

    var pretty = function(size) {
        var units = ['B','KB','MB','GB','TB','PB'];
        return new Number(size / Math.pow(1024, i = Math.floor(Math.log(size) / Math.log(1024))))
            .toFixed(2).toString() + ' ' + units[i];
    }

    pids.forEach(function(pid) {

        if (!fs.existsSync('/proc/' + pid + '/status')) {
            return;
        }

        var status = fs.readFileSync('/proc/' + pid + '/status', 'ascii');
        var rss    = (new RegExp('^VmRSS:(.+)', 'mgi')).exec(status);
        rss        = (rss) ? rss[1] : '0';
        rss        = rss.split(new RegExp('\\s')).slice(-2)[0];

        results.push({
            pid   : pid,
            usage : pretty(rss * 1024)
        });

        total += rss * 1024;
    });

    results.push({
        usage: pretty(total)
    });

    return results;
};

