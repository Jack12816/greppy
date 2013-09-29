/**
 * DataGrid Helper
 *
 * @module greppy/helper/controller/data-grid
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var sqlUtils = require('sequelize').Utils;
var extend   = require('extend');

/**
 * @constructor
 */
var DataGrid = function()
{
}

/**
 * Build the filter criteria for a given request.
 *
 * @param {Object} req - Request to analyse
 * @param {Object} res - Response to call on errors
 * @param {Object} options - Options to use
 * @return {Object}
 */
DataGrid.prototype.buildCriteria = function(req, res, options)
{
    options.limit = options.limit || 25;
    options.properties = options.properties || ['created_at'];
    options.pageSizes = options.pageSizes || [10, 25, 50, 100];
    options.fuzzySearch = ('undefined' !== typeof options.fuzzySearch) ? options.fuzzySearch : true;
    options.softDeletion = ('undefined' !== typeof options.softDeletion) ? options.softDeletion : true;

    var page   = parseInt(req.query.page) || 1;
    var limit  = parseInt(req.query.limit) || options.limit;
    var offset = (1 < page) ? ((page * limit) - limit) : 0;

    var view   = 'index';
    var render = req.query.render || 'all';

    // Render the whole page or just the partials
    if ('rows' === render) {
        view = '_index_rows';
    }

    if ('pagination' === render) {
        view = '_pagination';
    }

    return {
        view      : view,
        limit     : limit,
        offset    : offset,
        page      : page,
        pageSizes : options.pageSizes
    };
}

/**
 * Build a SQL pagination object by a criteria object.
 *
 * @param {Object} criteria - Criteria object to get data from
 * @param {Object} options - Options to use
 * @param {Function} callback - Function to call on finish
 * @return {Object}
 */
DataGrid.prototype.buildSqlPagination = function(criteria, options, callback)
{
    greppy.db.get(options.connection).getORM(function(orm, models) {

        models[options.entity].count({
            where : criteria.where
        }).success(function(count) {

            callback && callback(null, {
                limit     : criteria.limit,
                page      : criteria.page,
                count     : count || 0,
                pageSizes : criteria.pageSizes
            });

        }).error(function(err) {
            callback && callback(err);
        });
    });
}

/**
 * Build the SQL filter criteria for a given request.
 *
 * @param {Object} req - Request to analyse
 * @param {Object} res - Response to call on errors
 * @param {Object} options - Options to use
 * @return {Object}
 */
DataGrid.prototype.buildSqlCriteria = function(req, res, options)
{
    var criteria = this.buildCriteria(req, res, options);
    var where    = undefined;
    var order    = undefined;

    // Searching
    if (req.query.search && req.query.sprop) {

        var properties = options.properties;

        if (options.fuzzySearch) {
            properties.unshift('fuzzy');
        }

        // We don't accept any other properties
        if (-1 === properties.indexOf(req.query.sprop)) {
            res.end();
            return false;
        }

        var prefix = (options.wherePrefix || '');
        var query = ' LIKE '
            + sqlUtils.escape('%' + req.query.search + '%');

        if ('fuzzy' == req.query.sprop) {

            properties.shift();
            where = properties.join(query + ' OR ' + prefix) + query;

        } else {
            where = req.query.sprop + query;
        }

        where = '(' + prefix + where + ')';
    }

    // Soft-deletion filter
    if (options.softDeletion) {

        if ('undefined' === typeof where) {
            where = '';
        } else {
            where += ' AND '
        }

        if ('trash' == req.query.filter) {
            where += '(' + (options.wherePrefix || '') + 'deleted_at IS NOT NULL)';
        } else {
            where += '(' + (options.wherePrefix || '') + 'deleted_at IS NULL)';
        }
    }

    // Ordering
    if (req.query.order && req.query.oprop) {

        var properties = options.properties;
        var modes      = ['DESC', 'ASC'];

        // We don't accept any other properties
        if (-1 === properties.indexOf(req.query.oprop)) {
            res.end();
            return false;
        }

        // We don't accept any other modes
        if (-1 === modes.indexOf(req.query.order.toUpperCase())) {
            res.end();
            return false;
        }

        order = req.query.oprop + ' ' + req.query.order.toUpperCase();
    }

    criteria.where = where + (options.where ? ' ' + options.where : '');
    criteria.order = order;

    return criteria;
}

/**
 * Build a NoSQL pagination object by a criteria object.
 *
 * @param {Object} criteria - Criteria object to get data from
 * @param {Object} options - Options to use
 * @param {Function} callback - Function to call on finish
 * @return {Object}
 */
DataGrid.prototype.buildNoSqlPagination = function(criteria, options, callback)
{
    greppy.db.get(options.connection).getORM(function(orm, models) {

        models[options.entity].count(criteria.where, function(err, count) {

            if (err) {
                return callback && callback(err);
            }

            callback && callback(null, {
                limit     : criteria.limit,
                page      : criteria.page,
                count     : count || 0,
                pageSizes : criteria.pageSizes
            });
        });
    });
}

/**
 * Build the NoSQL filter criteria for a given request.
 *
 * @param {Object} req - Request to analyse
 * @param {Object} res - Response to call on errors
 * @param {Object} options - Options to use
 * @return {Object}
 */
DataGrid.prototype.buildNoSqlCriteria = function(req, res, options)
{
    var criteria = this.buildCriteria(req, res, options);
    var where    = {};
    var order    = {};

    // Searching
    if (req.query.search && req.query.sprop) {

        var properties = options.properties;

        if (options.fuzzySearch) {
            properties.unshift('fuzzy');
        }

        // We don't accept any other properties
        if (-1 === properties.indexOf(req.query.sprop)) {
            res.end();
            return false;
        }

        var query = {
            "$regex": '.*' + req.query.search + '.*',
            "$options": 'i'
        };

        if ('fuzzy' == req.query.sprop) {

            properties.shift();
            var or = [];

            properties.forEach(function(property) {

                if (/^(created|updated|deleted)_at$/i.test(property)) {
                    return;
                }

                var expression = {};
                expression[property] = query;
                or.push(expression);
            });

            where["$or"] = or;

        } else {

            var expression = {};
            expression[req.query.sprop] = query;
            where = expression;
        }
    }

    // Soft-deletion filter
    if (options.softDeletion) {

        if ('trash' == req.query.filter) {

            where.deleted_at = {
                "$ne": null
            }

        } else {

            where.deleted_at = null;
        }
    }

    // Ordering
    if (req.query.order && req.query.oprop) {

        var properties = options.properties;
        var modes      = ['DESC', 'ASC'];

        // We don't accept any other properties
        if (-1 === properties.indexOf(req.query.oprop)) {
            res.end();
            return false;
        }

        // We don't accept any other modes
        if (-1 === modes.indexOf(req.query.order.toUpperCase())) {
            res.end();
            return false;
        }

        order[req.query.oprop] = ('DESC' === req.query.order.toUpperCase()) ? -1 : 1;
    }

    // Allow extending the where condition
    extend(true, where, (options.where || {}));

    criteria.where = where;
    criteria.order = order;

    return criteria;
}

module.exports = DataGrid;

