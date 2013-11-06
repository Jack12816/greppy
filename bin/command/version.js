/**
 * Version Command
 *
 * @module greppy/cli/version
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var gitHelper = new (require('../../lib/helper/vcs/git'))();

exports.run = function()
{
    var table = new Table.TableOutputStream({
        omitHeader: true,
        columns: [
            {align: 'right', width: 36},
            {align: 'left'}
        ]
    });

    var greppyInfo = function(callback)
    {
        table.writeRow([
            'Greppy version'.bold.green,
            require(__dirname + '/../../package').version.white
        ]);

        gitHelper.getLastCommit(__dirname + '/../../', function(err, info) {

            if (err) {
                return callback && callback();
            }

            table.writeRow([
                'Git commit'.bold.green,
                (info.hash + ' by ' + info.author).white +
                (' <' + info.email + '> ').grey +
                (info.date + ' (' + info.timeAgo + ')').white
            ]);

            callback && callback();
        });
    };

    var cwdInfo = function()
    {
        // Find a Greppy project recursivly
        commandHelper.findProject();

        if (fs.existsSync('package.json')) {

            console.log();
            var package = require(process.cwd() + '/package.json');

            table.writeRow([
                'Current project'.bold.green,
                (package.name + (' <' + package.description + '>').grey).white
            ]);

            table.writeRow([
                'Version'.bold.green,
                package.version.white
            ]);

            gitHelper.getLastCommit(process.cwd(), function(err, info) {

                if (err) {
                    return;
                }

                table.writeRow([
                    'Git commit'.bold.green,
                    (info.hash + ' by ' + info.author).white +
                    (' <' + info.email + '> ').grey +
                    (info.date + ' (' + info.timeAgo + ')').white
                ]);
            });
        }
    };

    greppyInfo(cwdInfo);
};

