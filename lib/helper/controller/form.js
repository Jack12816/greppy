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
};

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
};

/**
 * Log and flash the error messsages.
 *
 * @param {Object} req - Client request
 * @param {Object} err - Error Object
 */
Form.prototype.logAndFlash = function(req, err)
{
    var message = 'Validation error occured at ' +
                  req.url.green.bold + ' - Details: ';

    if (err) {

        if (err.stack) {
            message += '\n' + err.stack;
        } else {
            message += '\n' + JSON.stringify(err, null, 4);
        }

    } else {
        message += 'No details given';
    }

    logger.warn(message);

    if (!req.flash) {
        return;
    }

    // MongoDB/Mongoose Error
    if (err.hasOwnProperty('name') && 'ValidationError' == err.name) {

        Object.keys(err.errors).forEach(function(key) {
            req.flash('error', err.errors[key].message);
        });

        return;
    }

    // Default case - normal error instance
    if (err instanceof Error) {
        return req.flash('error', err.message);
    }

    // Given error is an array - looks like Sequelize
    Object.keys(err).forEach(function(key) {

        if ('function' !== err[key].forEach) {
            return;
        }

        err[key].forEach(function(error) {
            req.flash('error', error);
        });
    });
};

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

    if (list && list.length) {

        list = list.map(function(item) {
            return parseInt(item, 10);
        });

        return list;
    }

    return [];
};

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

    if (list && list.length) {

        list.forEach(function(itm, idx) {
            list[idx] = (itm).toString();
        });

        return list;
    }

    return [];
};

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

    if (list && list.length) {

        list.forEach(function(itm, idx) {
            list[idx] = parseFloat(itm);
        });

        return list;
    }

    return [];
};

module.exports = Form;

