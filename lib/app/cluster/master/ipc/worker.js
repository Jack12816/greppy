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
 */
Worker.prototype.annotateContext = function(msg, context)
{
    // A worker already annotated the context
    if (this.master.workerContext) {
        return;
    }

    this.master.workerContext = context;

    var formattedRoutes = greppy.helper.get('project')
        .formatContextRoutes(context);

    if ('true' === process.env.DUMP_ROUTES) {

        // List routes
        formattedRoutes.forEach(function(route) {
            logger.debug('Registered route: ' + route);
        });

    } else {

        // Count routes
        logger.debug(
            'Registered %s routes',
            ('' + formattedRoutes.length).red
        );
    }
};

module.exports = Worker;

