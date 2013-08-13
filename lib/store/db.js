/**
 * Database-Connections Store
 *
 * @module greppy/store/db
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util  = require('util');
var Store = require('../store');

/**
 * @constructor
 */
var DBStore = function()
{
    DBStore.super_.call(this);
}

/**
 * Extend Greppy generic store
 */
util.inherits(DBStore, Store);

module.exports = DBStore;

