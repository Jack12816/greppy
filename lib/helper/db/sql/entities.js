/**
 * Entities Fetcher Helper
 *
 * @module greppy/helper/db/sql/entities
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var async = require('async');

/**
 * @constructor
 */
var EntitiesHelper = function()
{
}

/**
 * Fetch all models of the given models in parallel.
 *
 * @param {Array} models - Entities to fetch
 * @param {Object} [criteria] - Criteria to use for filtering
 * @param {Function} callback - Function to call on finish
 * @return void
 */
EntitiesHelper.prototype.fetchAll = function(models, criteria, callback)
{
    if (!models || 0 === models.length) {
        throw new Error('No models given.');
        return;
    }

    if ('function' === typeof criteria) {
        callback = criteria;
        criteria = undefined;
    }

    async.map(models, function(model, callback) {

        model.findAll(criteria).success(function(records) {
            callback && callback(null, records);
        }).error(function(err) {
            callback && callback(err);
        });

    }, function(err, results) {

        if (err) {
            return callback && callback(err);
        }

        var result = {};

        models.forEach(function(item, idx) {
            result[item.tableName] = results[idx];
        });

        callback && callback(undefined, result);
    });
}

/**
 * Fetch all by defined groups in parallel.
 *
 * Example groups:
 *   [
 *       {
 *           name: "groupName1",
 *           criteria: {
 *               where: {deleted_at: null}
 *           },
 *           models: [
 *               models.Product,
 *               models.Portal
 *           ]
 *       }
 *   ]
 *
 * @param {Array} groups - Groups to fetch
 * @param {Function} callback - Function to call on finish
 * @return void
 */
EntitiesHelper.prototype.fetchGroups = function(groups, callback)
{
    var self = this;

    async.map(groups, function(group, callback) {

        self.fetchAll(group.models, group.criteria || null, function(err, records) {

            if (err) {
                return callback && callback(err);
            }

            callback && callback(null, records);

        });

    }, function(err, results) {

        if (err) {
            return callback && callback(err);
        }

        var result = {};

        groups.forEach(function(group, idx) {
            result[group.name] = results[idx];
        });

        callback && callback(undefined, result);
    });
}

module.exports = EntitiesHelper;

