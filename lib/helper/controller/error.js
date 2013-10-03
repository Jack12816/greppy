/**
 * Error Helper
 *
 * @module greppy/helper/controller/error
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var ErrorHelper = function()
{
};

/**
 * Format the given error to print in an uniform way.
 *
 * @param {Object} err - Error object
 * @return {String}
 */
ErrorHelper.prototype.format = function(err)
{
    var self = this;

    if (err instanceof Array) {

        var str = '';

        err.forEach(function(item) {
            str += self.format(item) + '\n';
        });

        return str;
    }

    var cur = '';

    if (err instanceof String) {
        cur = err;
    }

    if ('object' === typeof err) {
        cur = JSON.stringify(err, null, '  ');
    }

    if ('{}' == cur) {
        cur = err.toString();
    }

    return cur;
};

/**
 * Log the error with the corresponding request.
 *
 * @param {Object} req - Request object
 * @param {Object} err - Error object
 * @return void
 */
ErrorHelper.prototype.log = function(req, err)
{
    logger.error(
        'Error occured on '
        + req.url.green.bold + ' - Details:\n'
        + this.format(err).yellow
    );
};

/**
 * Log the error and respond with an internal server
 * error message (Code 500).
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} err - Error object
 * @return void
 */
ErrorHelper.prototype.respond500 = function(req, res, err)
{
    this.log(req, err);
    res.status(500);
    res.end('Internal server error occured.');
};

/**
 * Log and forward to the default error page.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} err - Error object
 * @param {String} [view] - Name of the error view to render
 * @param {Object} [locals] - Locals to pass to the view
 * @return void
 */
ErrorHelper.prototype.showErrorPage = function(req, res, err, view, locals)
{
    this.log(req, err);
    res.render('error/' + (view || 'operation-failed'), locals || {});
};

/**
 * Log and write a flash message on the next request.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} err - Error object
 * @param {Object} options - Options for the message
 * @return void
 */
ErrorHelper.prototype.flash = function(req, res, err, options)
{
    this.log(req, err);

    if (req.flash) {

        var message = options.message || ('An error occured. ' + options.entity
            + ' couldn\'t be ' + options.operation);

        req.flash('error', message);
    }

    res.end();
};

module.exports = ErrorHelper;

