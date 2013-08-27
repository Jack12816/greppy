/**
 * DataGrid Helper
 *
 * @module greppy/helper/controller/data-grid
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

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
    options.fuzzySearch = ('undefined' !== typeof options.fuzzySearch) ? options.fuzzySearch : true;
    options.softDeletion = ('undefined' !== typeof options.softDeletion) ? options.softDeletion : true;

    var page   = req.query.page || 1;
    var limit  = req.query.limit || options.limit;
    var offset = (1 < page) ? ((page * limit) - limit) : 0;

    var where  = undefined;
    var order  = undefined;

    var view   = 'index';
    var render = req.query.render || 'all';

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

        var query = ' LIKE "%' + req.query.search + '%"';

        if ('fuzzy' == req.query.sprop) {

            properties.shift();
            where = properties.join(query + ' OR ') + query;

        } else {
            where = req.query.sprop + query;
        }

        where = '(' + where + ')';
    }

    // Soft-deletion filter
    if (options.softDeletion) {

        if ('undefined' === typeof where) {
            where = '';
        } else {
            where += ' AND '
        }

        if ('trash' == req.query.filter) {
            where += '(deleted_at IS NOT NULL)';
        } else {
            where += '(deleted_at IS NULL)';
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

    // Render the whole page or just the partials
    if ('rows' === render) {
        view = '_index_rows';
    }

    return {
        view   : view,
        limit  : limit,
        offset : offset,
        where  : where,
        order  : order
    };
}

module.exports = DataGrid;

