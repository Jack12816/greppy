/**
 * Scaffolding Controller Helper
 *
 * @module greppy/cli/scaffolding/helper/controller
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var helper = {};

/**
 * Get mapped attributes for a given model.
 *
 * @param {String} backend - Name of the backend
 * @param {String} modelPath - Path of the model
 * @return {Array}
 */
helper.getModelAttributes = function(backend, modelPath)
{
    var model = undefined;
    var attributes = [];

    if ('mysql' === backend) {

        var orm = new (require('sequelize'))();
        model = orm.import(modelPath);

        Object.keys(model.rawAttributes).forEach(function(attr) {

            var attrObj  = model.rawAttributes[attr];
            var nullable = true;
            var type     = attrObj.type;

            if (attrObj.hasOwnProperty('allowNull')) {
                nullable = attrObj.allowNull;
            }

            if (attrObj.hasOwnProperty('validate') &&
                attrObj.validate.hasOwnProperty('notEmpty')) {
                nullable = attrObj.validate.notEmpty;
            }

            if (-1 !== type.indexOf('VARCHAR')) {
                type = 'STRING';
            }

            if (-1 !== type.indexOf('TINYINT(1)')) {
                type = 'BOOLEAN';
            }

            if (-1 !== type.indexOf('DATETIME')) {
                type = 'DATE';
            }

            attributes.push({
                name     : attr,
                type     : type.toLowerCase(),
                nullable : nullable,
                default  : attrObj.defaultValue || undefined
            });
        });

        return attributes;
    }

    if ('mongodb' === backend) {

        Schema = require('mongoose').Schema;
        var schema = require(modelPath);

        Object.keys(schema.tree).forEach(function(attr) {

            var attrObj  = schema.tree[attr];
            var nullable = true;
            var type     = attrObj.type;

            if (attrObj.hasOwnProperty('required')) {
                nullable = attrObj.required;
            }

            // Skip virtuals
            if (!type) {
                return;
            }

            // Skip custom data-types
            if ('function' !== typeof type) {
                return;
            }

            attributes.push({
                name     : attr,
                type     : (new type()).constructor.name.toLowerCase(),
                nullable : nullable,
                default  : attrObj.default || undefined
            });
        });

        // Clear global variable pollution
        delete Schema;

        return attributes;
    }

    return [];
};

/**
 * Map the details for given attributes array.
 *
 * @param {Array} attributes - Array of attributes
 * @return {Array}
 */
helper.mapDetails = function(results, attributes)
{
    var inf                      = require('inflection');
    var attrs                    = [];
    results.softDeletion         = 'false';
    results.softDeletable        = false;
    results.searchableAttributes = '';

    attributes.forEach(function(attr, idx) {

        if ('id' == attr.name ||
            'created_at' == attr.name ||
            'updated_at' == attr.name) {
            return;
        }

        if ('deleted_at' == attr.name) {
            results.softDeletion = 'true';
            results.softDeletable = true;
            return;
        }

        if (null !== attr.name.match(/_id$/gi)) {
            return;
        }

        results.searchableAttributes += '\'' + attr.name + '\', ';

        attr.parsing = 'req.body.' + results.name + '_' + attr.name;

        if ('string' == attr.type ||
            'integer' == attr.type ||
            'float' == attr.type ||
            'number' == attr.type ||
            'boolean' == attr.type ||
            'date' == attr.type) {
            attr.element = 'input';
            attr.elementType = 'text';
            attr.isTextarea = false;
        }

        if ('string' == attr.type && ~attr.name.indexOf('password')) {
            attr.elementType = 'password';
        }

        if ('string' == attr.type || 'text' == attr.type) {
            attr.parsing = '(' + attr.parsing + ').trim()';
        }

        if ('text' == attr.type) {
            attr.element = 'textarea';
            attr.isTextarea = true;
        }

        if ('boolean' == attr.type) {
            attr.elementType = 'checkbox';
            attr.parsing += ' == \'true\'';
        }

        if ('float' == attr.type) {
            attr.parsing = 'parseFloat(' + attr.parsing + ')';
        }

        if ('integer' == attr.type || 'number' == attr.type) {
            attr.parsing = 'parseInt(' + attr.parsing + ')';
        }

        if ('date' == attr.type) {
            attr.parsing = '(new Date(Date.parse(' + attr.parsing + '))).toISOString()';
        }

        attr.formProperty       = results.name + '_' + attr.name;
        attr.humanized          = inf.humanize(attr.name);
        attr.humanizedLowercase = inf.humanize(attr.name, true);
        attr.entity             = results.name;
        attr.required           = attr.nullable;

        attrs.push(attr);
    });

    return attrs;
};

module.exports = helper;

