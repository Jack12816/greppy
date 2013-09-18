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

    if (!req.flash) {
        return;
    }

    Object.keys(err).forEach(function(key) {
        err[key].forEach(function(error) {
            req.flash('error', error);
        });
    });
}

/**
 * Remap a scalar value into an array containing a single
 * integer or convert an array into array containing
 * only numbers.
 *
 * @param {Mixed} list - Value or list to remap
 * @return {Array}
 */
Form.prototype.sanitizeIntegerList = function(list)
{
    if (list && !(list instanceof Array)) {
        return [parseInt(list)];
    }

    if (list.length) {

        list.forEach(function(itm, idx) {
            list[idx] = parseInt(itm);
        });

        return list;
    }

    return [];
}

/**
 * Remap a scalar value into an array containing a single
 * string or convert an array into array containing
 * only strings.
 *
 * @param {Mixed} list - Value or list to remap
 * @return {Array}
 */
Form.prototype.sanitizeStringList = function(list)
{
    if (list && !(list instanceof Array)) {
        return [(list).toString()];
    }

    if (list.length) {

        list.forEach(function(itm, idx) {
            list[idx] = (itm).toString();
        });

        return list;
    }

    return [];
}

/**
 * Remap a scalar value into an array containing a single
 * float or convert an array into array containing
 * only floats.
 *
 * @param {Mixed} list - Value or list to remap
 * @return {Array}
 */
Form.prototype.sanitizeFloatList = function(list)
{
    if (list && !(list instanceof Array)) {
        return [parseFloat(list)];
    }

    if (list.length) {

        list.forEach(function(itm, idx) {
            list[idx] = parseFloat(itm);
        });

        return list;
    }

    return [];
}

module.exports = Form;

