/**
 * Array Data-Type Extension
 *
 * @module greppy/extension/datatype/array
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var util = require('util');

/**
 * Convert a string to camelCase.
 *
 * @return {String}
 */
String.prototype.toCamelCase = function()
{
    var result = this.replace(/(\-{1,}[a-z])/g, function(m) {
        return m.toUpperCase().remove(/\-/g);
    });

    return result.charAt(0).toLowerCase() + result.substring(1).remove(/\-+$/);
};

/**
 * Humanize a string for pretty printing.
 *
 * @param {Boolean} breakDashs - To break or not to break dashs
 * @return {String}
 */
String.prototype.humanize = function(breakDashs)
{
    breakDashs = ('undefined' !== typeof breakDashs) ? breakDashs : true;

    var result = this.replace(/_/g, ' ')
       .replace(/(\w+)/g, function(match) {
            return match.charAt(0).toUpperCase() + match.slice(1);
        });

    if (true === breakDashs) {
        result = result
            .replace(/-/g, '/')
            .replace(/([A-Z])/g, " $1");
    }

    result = result
        .replace(/([\w])\/[\s]/g, '$1 / ')
        .replace(/[\s]+/g, ' ')
        .trim();

    return result;
};

/**
 * Capitalize a string.
 *
 * @return {String}
 */
String.prototype.capitalize = function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Decapitalize a string.
 *
 * @return {String}
 */
String.prototype.decapitalize = function()
{
    return this.charAt(0).toLowerCase() + this.slice(1);
};

/**
 * Encode all HTML entities of a string.
 *
 * @return {String}
 */
String.prototype.htmlencode = function()
{
    return this
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Decode all HTML entities of a string.
 *
 * @return {String}
 */
String.prototype.htmldecode = function()
{
    return this
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, '\'');
};

/**
 * Encode a string as URL.
 *
 * @return {String}
 */
String.prototype.urlencode = function()
{
    return (require('querystring')).escape(this);
};

/**
 * Decode a string as URL.
 *
 * @return {String}
 */
String.prototype.urldecode = function()
{
    return (require('querystring')).unescape(this);
};

/**
 * XML Prettify a string.
 *
 * @return {String}
 */
String.prototype.prettifyXML = function()
{
    return (require('pretty-data').pd).xml(this);
};

/**
 * JSON Prettify a string.
 *
 * @return {String}
 */
String.prototype.prettifyJSON = function()
{
    return (require('pretty-data').pd).json(this);
};

/**
 * CSS Prettify a string.
 *
 * @return {String}
 */
String.prototype.prettifyCSS = function()
{
    return (require('pretty-data').pd).css(this);
};

/**
 * SQL Prettify a string.
 *
 * @return {String}
 */
String.prototype.prettifySQL = function()
{
    return (require('pretty-data').pd).sql(this);
};

/**
 * Truncate a string to the given amount of words.
 *
 * @param {Integer} words - Number of words to truncate
 * @return {String}
 */
String.prototype.words = function(words)
{
    words = words || 10;

    var split = this.split(/\s/);
    var truncated = split.slice(0, words);
    var result = truncated.join(' ');

    if (truncated.length < split.length) {
        return result + ' ..';
    }

    return result;
};

/**
 * Remove contents of a string.
 * Multiple values may be passed as arguments.
 *
 * @param {String|RegEx} Values to be replaced.
 * @return {String}
 */
String.prototype.remove = function()
{
    var result = this.slice(0);

    function removeStringFromResult(str) {
        while (-1 !== result.indexOf(str)) {
            result = result.replace(str, '');
        }
    }

    for (var i = 0; i < arguments.length; i++) {
        if ('string' === typeof arguments[i]) {
            removeStringFromResult(arguments[i]);
        } else {

            // RegEx
            result = result.replace(arguments[i], '');
        }
    }

    return result;
};

/**
 * Format a string with the help of util.format.
 *
 * @param {Mixed} arguments - All arguments of util.format
 * @return {String}
 */
String.prototype.format = function()
{
    return util.format.bind(util, this.slice(0))
                      .apply(util, arguments);
};

