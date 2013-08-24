/**
 * Form Helper
 *
 * @module greppy/helper/controller/form
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * @constructor
 */
var Form = function()
{
}

/**
 * Remap a scalar value into an array.
 *
 * @param {Mixed} list - Value or list to remap to array
 * @return {Array}
 */
Form.prototype.sanitizeList = function(list)
{
    if (list && !(list instanceof Array)) {
        return [list];
    }

    return list || [];
}

/**
 * Log and flash the error messsages.
 *
 * @param {Object} req - Client request
 * @param {Object} err - Error Object
 * @return void
 */
Form.prototype.logAndFlash = function(req, err)
{
    logger.warn(
        'Validation error occured at '
        + req.url.green.bold
        + ' - '
        + JSON.stringify(err)
    );

    Object.keys(err).forEach(function(key) {
        err[key].forEach(function(error) {
            req.flash('error', error);
        });
    });
}

module.exports = Form;

