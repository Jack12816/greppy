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

        context.routes.forEach(function(route) {

            logger.debug(
                'Registered route: [' + route.method.green.bold + '] '
                + route.path
                + ' -> ' + route.module.blue
                + '::' + route.controller.red
                + '::' + route.action.yellow
            );
        });
    }
}

module.exports = Worker;

