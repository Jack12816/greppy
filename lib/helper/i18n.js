/**
 * I18N Helper
 *
 * @module greppy/helper/i18n
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util = require('util');

/**
 * @constructor
 */
var I18nHelper = function()
{
    this.iso639WithTags = require('./i18n/iso639-tags.json');
};

/**
 * Get a list of all ISO 639 language codes with their tags/regions.
 *
 * @return {Array}
 */
I18nHelper.prototype.listLanguagesCodes = function()
{
    return this.iso639WithTags;
};

/**
 * Checks if the given language code is valid/known.
 *
 * @param {String} code - Code to check
 * @return {Boolean}
 */
I18nHelper.prototype.checkLanguageCode = function(code)
{
    return (~this.iso639WithTags.indexOf(code)) ? true : false;
};

module.exports = I18nHelper;

