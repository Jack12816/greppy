/**
 * Array Data-Type Extension
 *
 * @module greppy/extension/datatype/array
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

/**
 * Convert a string to camelCase.
 *
 * @return {String}
 */
String.prototype.toCamelCase = function()
{
    return this.replace(/(\-[a-z])/g, function(m){
        return m.toUpperCase().replace('-','');}
    );
}

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
}

/**
 * Capitalize a string.
 *
 * @return {String}
 */
String.prototype.capitalize = function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Decapitalize a string.
 *
 * @return {String}
 */
String.prototype.decapitalize = function()
{
    return this.charAt(0).toLowerCase() + this.slice(1);
}

