/**
 * Error Helper
 *
 * @module greppy/helper/controller/error
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var Error = function()
{
    this.log = function(req, err) {

        logger.error(
            'Error occured on '
            + req.url.green.bold + ' - Details:\n'
            + JSON.stringify(err, null, '  ').yellow
        );
    }
}

/**
 * Log the error and respond with an internal server
 * error message (Code 500).
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} err - Error object
 * @return void
 */
Error.prototype.respond500 = function(req, res, err)
{
    this.log(req, err);
    res.status(500);
    res.end('Internal server error occured.');
}

/**
 * Log and forward to the default error page.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} err - Error object
 * @param {String} [view] - Name of the error view to render
 * @return void
 */
Error.prototype.showErrorPage = function(req, res, err, view)
{
    this.log(req, err);
    res.render('error/' + (view || 'operation-failed'));
}

/**
 * Log and write a flash message on the next request.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} err - Error object
 * @param {Object} options - Options for the message
 * @return void
 */
Error.prototype.flash = function(req, res, err, options)
{
    this.log(req, err);

    if (req.flash) {

        var message = options.message || ('An error occured. ' + options.entity
            + ' couldn\'t be ' + options.operation);

        req.flash('error', message);
    }

    res.end();
}

module.exports = Error;

