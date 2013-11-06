/**
 * Date Helper
 *
 * @module greppy/helper/controller/date
 * @author Patrick Jaksch <mail@deadly-silence.de>
 */

var moment = require('moment');

/**
 * @constructor
 */
var Date = function()
{
};

/**
 * Parse the date and return date object.
 *
 * @param {String} date - date string
 * @param {String} format - date format
 * @return {Date}
 */
Date.prototype.parse = function(date, format)
{
    date = moment(date, format);

    if (!date.isValid()) {
        return null;
    }

    return date.toDate();
};

/**
 * Parse the date and return ISO string.
 *
 * @param {String} date - date string
 * @param {String} format - date format
 * @return {String}
 */
Date.prototype.parseToIso = function(date, format)
{
    date = moment(date, format);

    if (!date.isValid()) {
        return null;
    }

    return date.toISOString();
};


/**
 * Format the date and return it as a string.
 *
 * @param {String} date - date string
 * @param {Object} formats - containing both, the input and output format
 * @return {String}
 */
Date.prototype.format = function(date, formats)
{
    if ('undefined' == typeof date || 'undefined' == typeof formats) {
        return null;
    }

    return moment(date, formats.input).format(formats.output);
};

/**
 * Compare two dates according to the given compare operations.
 *
 * @param {Object|String} firstDate - containing either both, the first date
 * and its format, or only the date as a string
 * @param {Object|String} operations - contains an option set of operations
 * @param {Object|String} secondDate - containing either both, the second
 * date and its format
 * @return {Boolean}
 */
Date.prototype.compare = function(firstDate, operations, secondDate)
{
    // check the needed parameters and if no impossible setting is used
    if (
        'undefined' === typeof firstDate  ||
        'undefined' === typeof secondDate ||
        'undefined' === typeof operations ||
        (
            'string' !== typeof operations &&
            (operations.before && operations.after)
        )
    ) {
        throw new Error('The information provided was either insufficient or incorrect to compare the dates.');
    }

    var first  = null;
    var second = null;

    // check whether firstDate is an object or a scalar value
    if ('string' === typeof firstDate) {
        first = moment(firstDate);
    } else {
        first = moment(firstDate.date, firstDate.format);
    }

    // check whether secondDate is an object or a scalar value
    if ('string' === typeof secondDate) {
        second = moment(secondDate);
    } else {
        second = moment(secondDate.date, secondDate.format);
    }

    // assume all checks are invalid unless proven otherwise
    var isValid = false;

    // check whether operations is an object or a scalar value
    if ('string' === typeof operations) {

        if ('before' === operations) {
            isValid = first.isBefore(second);
        } else if ('after' === operation) {
            isValid = first.isAfter(second);
        } else if ('same' === operation) {
            // workaround since isSame doesn't work as intended
            isValid = first.unix() == second.unix();
        } else {
            throw new Error('No valid operation has been passed to the method.');
        }

    } else {

        if (operations.before) {
            isValid = first.isBefore(second);
        }

        if (!isValid && operations.after) {
            isValid = first.isAfter(second);
        }

        if (!isValid && operations.same) {

            // workaround since isSame doesn't work as intended
            isValid = first.unix() == second.unix();
        }
    }

    return isValid;
};

module.exports = Date;

