/**
 * Worker-Context IPC
 *
 * @module greppy/app/cluster/master/ipc/worker
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var Worker = function(options)
{
    this.master = options.master;
};

/**
 * Log an given worker request with userdefined content.
 *
 * @return void
 */
Worker.prototype.annotateContext = function(msg, context)
{
    // A worker already annotated the context
    if (this.master.workerContext) {
        return;
    }

    this.master.workerContext = context;

    if (context.routes) {

        var maxPathLength = 0;
        var maxMethodLength = 0;

        context.routes.forEach(function(route) {

            maxPathLength = (route.path.length > maxPathLength)
                ? route.path.length
                : maxPathLength;

            maxMethodLength = (route.method.length > maxMethodLength)
                ? route.method.length
                : maxMethodLength;
        });

        context.routes.forEach(function(route) {

            while (maxMethodLength > route.method.length) {
                route.method = ' ' + route.method;
            }

            while (maxPathLength > route.path.length) {
                route.path += ' ';
            }

            logger.debug(
                'Registered route: [' + route.method.green.bold + '] '
                + '[' + (null === route.auth ? '+'.green.bold : '-'.red.bold) + '] '
                + route.path
                + ' -> ' + route.module.blue
                + '::' + route.controller.red
                + '::' + route.action.yellow
            );
        });
    }
}

module.exports = Worker;

