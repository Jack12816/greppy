/**
 * Start Command
 *
 * @module greppy/cli/start
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

exports.run = function(contexts, debug)
{
    // Find a Greppy project recursivly
    var appPath = commandHelper.findProjectOrDie();

    contexts        = commandHelper.checkContexts(contexts || []);
    var startScript = projectHelper.findStartScript(process.cwd());

    if (false === startScript) {

        console.log('No start script was found in the current project.');
        console.log('You should have an app/worker.js or an app/master.js');
        process.exit(1);
        return;
    }

    // A normal un-debugged start process
    if (!debug) {

        // Start all contexts with the found start script
        contexts.contexts.forEach(function(context) {

            var state = processHelper.getContextState(process.cwd(), context);
            var isRunning = commandHelper.checkForRunningContextState(state);

            if (isRunning) {
                return;
            }

            // Start the daemon process
            var args   = ['--context', context];
            var stderr = fs.openSync(appPath + 'var/log/' + context + '.master.stderr.log', 'a');
            var child  = daemon.daemon(startScript, args, {
                cwd    : appPath,
                stderr : stderr
            });

            fs.writeFileSync(state.file, child.pid);

            global.table.writeRow([
                'start'.bold.green,
                (context + ' -- started (' + child.pid + ')').white
            ]);
        });

        // We are done with this starting process
        return;
    }

    // A debugged start process for only one context
    // We only start the one process in foreground
    if (1 === contexts.contexts.length) {

        // Remap the context variable to fit the situation
        var context = contexts.contexts[0];

        var state = processHelper.getContextState(process.cwd(), context);
        var isRunning = commandHelper.checkForRunningContextState(state);

        if (isRunning) {
            return;
        }

        var print = function (data) {
            console.log(data.toString().replace(/\n$/, ''));
        };

        if (process.stdin.setRawMode) {

            process.stdin.resume();
            process.stdin.setRawMode(true);

            process.stdin.on('data', function (data) {

                // Ctrl+C or Ctrl+D
                if ('\3' == data || '\4' == data) {
                    process.stdin.pause();
                    emitExitToChild();
                }

                // F5 was pressed
                if (String.fromCharCode(0x1b,0x5b,0x31,0x35,0x7e) == data) {
                    console.log();
                    child.kill('SIGHUP');
                }
            });
        }

        var child = require('child_process').spawn(process.execPath, [
            startScript, '--context', context, '--debug'
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        var emitExitToChild = function() {
            console.log();
            child.kill('SIGINT');
        };

        process.on('SIGINT', emitExitToChild);
        process.on('SIGTERM ', emitExitToChild);

        child.stdout.on('data', print);
        child.stderr.on('data', print);

        child.on('close', function() {
            process.stdin.pause();
        });

        fs.writeFileSync(state.file, child.pid);

        // We are done with this starting process
        return;
    }

    // A debugged start process for more than one context
    // We start a GNU Screen session for the given contexts
    if (1 < contexts.contexts.length) {

        var conf = fs.readFileSync(__dirname + '/../template/screen.conf.tmpl', 'utf8');
        var tabs = [];
        var projectName = require(process.cwd() + '/package').name;

        // Build the configuration for all contexts
        // So every context became a tab on the screen session
        contexts.contexts.forEach(function(context) {

            tabs.push(
                'screen -t ' + context + ' ' + (tabs.length + 1) +
                ' greppy -s ' + context + ' -d'
            );
        });

        // Replace all template tokens
        conf = conf.replace('{{tabs}}', tabs.join('\n'))
                   .replace('{{projectName}}', projectName)
                   .replace('{{contextList}}', contexts.contexts.join(','));

        var tmpConfPath = '/tmp/.' + projectName + '.screenrc';
        fs.writeFileSync(tmpConfPath, conf);

        var screen = new (require('screen-init'))({
            args: ['-c', tmpConfPath]
        });

        // We are done with this starting process
        return;
    }
};

