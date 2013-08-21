/**
 * Start command
 *
 * @module greppy/cli/start
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var fs     = require('fs');
var path   = require('path');
var colors = require('colors');
var daemon = require('daemon');
var Table  = require('tab');

exports.run = function(contexts, debug)
{
    contexts    = require('../helpers/context').getContextsByArgs(contexts);
    var appPath = path.normalize(process.cwd() + '/');

    if (!contexts) {
        console.log(appPath.green.bold + ' is not a Greppy project.');
        process.exit(1);
        return;
    }

    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 32},
            {align: 'left'}
        ]
    });

    var startScript = 'worker.js';
    var nodeBin = 'node';

    // Find the implementation
    fs.readdirSync(appPath + 'app').some(function(file) {

        if (file.match(/master/gi) && file.match(/\.js$/gi)) {
            startScript = file;
            return true;
        }
    });

    startScript = appPath + 'app/' + startScript;

    if (!debug) {

        // Start all contexts with the found start script
        contexts.forEach(function(context) {

            var contextState = helper.getContextState(context);

            if (contextState.running) {
                table.writeRow([
                    'start '.bold.green,
                    new String(context + ' -- already running (' + contextState.pid + ')').white
                ]);
                return;
            }

            // Start the daemon process
            var args   = ['--context', context];
            var stderr = fs.openSync(appPath + 'var/log/' + context + '.master.stderr.log', 'a');
            var child  = daemon.daemon(startScript, args, {
                cwd    : appPath,
                stderr : stderr
            });

            // Write its pid
            fs.writeFileSync(contextState.pidFile, child.pid);

            table.writeRow([
                'start '.bold.green,
                new String(context + ' -- started (' + child.pid + ')').white
            ]);
        });

        return;
    }

    if (1 === contexts.length) {

        var contextState = helper.getContextState(contexts[0]);

        if (contextState.running) {
            table.writeRow([
                'start '.bold.green,
                new String(contexts[0] + ' -- already running (' + contextState.pid + ')').white
            ]);
            return;
        }

        var print = function (data) {
            console.log(data.toString().replace(/\n$/, ''));
        };

        process.stdin.resume();

        var child = require('child_process').spawn(process.execPath, [
            startScript, '--context', contexts[0], '--debug'
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        var emitExitToChild = function() {
            console.log();
            child.kill('SIGINT');
        }

        process.on('SIGINT', emitExitToChild);
        process.on('SIGTERM ', emitExitToChild);

        child.stdout.on('data', print);
        child.stderr.on('data', print);

        child.on('close', function() {
            process.stdin.pause();
        });

        // Write its pid
        fs.writeFileSync(contextState.pidFile, child.pid);

        return;
    }

    var screenConf = [
        "# Greppy generated screen config",
        "# Do not edit.",
        "",
        "# Custom screen config",
        "startup_message off",
        "msgminwait 0",
        "defscrollback 50000",
        "",
        "# Initial tabs",
        "{{tabs}}",
        "sessionname {{projectName}}",
        "",
        "# Custom keybindings",
        "bindkey -k kl prev",
        "bindkey -k kr next",
        "bindkey -k k9 quit",
        "bindkey -k ku copy",
        "",
        "# Focus on the first window",
        "select 1",
        "",
        "# Tabbar",
        "hardstatus alwayslastline",
        "hardstatus string '%-Lw%{= BW}%50>%n%f* %t%{-}%+Lw%<'"
    ].join('\n');

    var tabs = [];
    var projectName = require(process.cwd() + '/package').name;

    // Start all contexts with the found start script
    contexts.forEach(function(context) {

        tabs.push(
            'screen -t ' + context + ' ' + new String(tabs.length + 1)
            + ' greppy -s ' + context + ' -d'
        );
    });

    screenConf = screenConf.replace('{{tabs}}', tabs.join('\n'))
                           .replace('{{projectName}}', projectName)
                           .replace('{{contextList}}', contexts.join(','));

    var tmpScreenConfPath = '/tmp/.' + projectName + '.screenrc', screenConf;
    fs.writeFileSync(tmpScreenConfPath, screenConf);

    var screen = new (require('screen-init'))({
        args: ['-c', tmpScreenConfPath]
    });
}

var helper = {};

helper.getContextState = function(context)
{
    var appPath = path.normalize(process.cwd() + '/');
    var running = false;
    var pidFile = appPath + 'var/run/' + context + '.pid';

    if (fs.existsSync(pidFile)) {

        var existingPid = fs.readFileSync(pidFile, 'utf8');

        if (fs.existsSync('/proc/' + existingPid + '/status')) {
            running = true;
        }
    }

    return {
        running : running,
        pid     : existingPid,
        pidFile : pidFile
    };
}

