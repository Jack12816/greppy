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
}

/**
 * Parse the date and return date object.
 *
 * @param {String} date - date string
 * @param {String} format - date format
 * @return {Date}
 */
Date.prototype.parse = function(date, format)
{
    var date = moment(date, format);

    if (!date.isValid()) {
        return null;
    }

    return date.toDate();
}

/**
 * Parse the date and return ISO string.
 *
 * @param {String} date - date string
 * @param {String} format - date format
 * @return {String}
 */
Date.prototype.parseToIso = function(date, format)
{
    var date = moment(date, format);

    if (!date.isValid()) {
        return null;
    }

    return date.toISOString();
}

module.exports = Date;

