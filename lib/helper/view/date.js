/**
 * DateHelper Helper
 *
 * @module greppy/helper/view/date
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util   = require('util');

/**
 * @constructor
 */
var DateHelper = function()
{
    this.moment = require('moment');
}

/**
 * Set the language of all date outputs.
 *
 * @param {String} lang - Language to set
 * @return void
 */
DateHelper.prototype.setLang = function(lang)
{
    this.moment.lang(lang);
}

/**
 * Format a date with the help of moment.
 *
 * @param {Date} date - The date to format
 * @param {String} format - Format string which will be processed by moment
 * @return {String}
 */
DateHelper.prototype.format = function(date, format)
{
    return this.moment(date).format(format);
}

/**
 * Calculate the difference from date to now in minutes.
 *
 * @param {Date} date - The first date
 * @return {Integer}
 */
DateHelper.prototype.diffToNow = function(date)
{
    return this.moment(date).diff(this.moment(new Date()), 'minutes');
};

/**
 * Check if the two given dates are equals.
 *
 * @param {Date} dateA - The first date
 * @param {Date} dateB - The second date
 * @return {Boolean}
 */
DateHelper.prototype.equals = function(dateA, dateB)
{
    if (util.isDate(dateA) && util.isDate(dateB)) {
        return dateA.getTime() === dateB.getTime();
    }

    return false;
}

/**
 * Check if the two given dates are different.
 *
 * @param {Date} dateA - The first date
 * @param {Date} dateB - The second date
 * @return {Boolean}
 */
DateHelper.prototype.different = function(dateA, dateB)
{
    return (this.equals(dateA, dateB)) ? false : true;
}

module.exports = DateHelper;

