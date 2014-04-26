/**
 * Tests for /lib/helper/controller/data-grid
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should   = require('should');
var path     = require('path');
var root     = path.resolve(__dirname + '/../../../../../../');
var DataGrid = require(root + '/lib/helper/controller/data-grid');
var dg       = null;

describe('DataGrid', function() {

    beforeEach(function() {
        dg = new DataGrid();
    });

    describe('buildBaseCriteria', function() {

        it('should return a critertia object with default values if the req has no special values', function() {

            var reqMockup = {
                query: {}
            };

            var result = dg.buildBaseCriteria(reqMockup, {}, {});

            result.view.should.equal('index');
            result.limit.should.equal(25);
            result.offset.should.equal(0);
            result.page.should.equal(1);
            result.pageSizes.should.eql([10, 25, 50, 100]);
        });

        it('should should return a criteria object with special values if options were passed', function() {

            var reqMockup = {
                query: {}
            };

            var result = dg.buildBaseCriteria(reqMockup, {}, {
                limit: 123,
                pageSizes: [1, 2, 3, 4]
            });

            result.limit.should.equal(123);
            result.pageSizes.should.eql([1, 2, 3, 4]);
        });

        it('should return a criteria object with custom page, limit and offset, based on the values of the query', function() {

            var reqMockup = {
                query: {
                    page: 12,
                    limit: 500
                }
            };

            var result = dg.buildBaseCriteria(reqMockup, {}, {});

            result.view.should.equal('index');
            result.limit.should.equal(500);
            result.offset.should.equal(5500);
            result.page.should.equal(12);
            result.pageSizes.should.eql([10, 25, 50, 100]);
        });

        it('should return a criteria object with the correct view-property, based on the render-value of the query', function() {

            var reqMockup1 = {
                query: {
                    render: 'rows'
                }
            };

            var reqMockup2 = {
                query: {
                    render: 'pagination'
                }
            };

            var result1 = dg.buildBaseCriteria(reqMockup1, {}, {});
            var result2 = dg.buildBaseCriteria(reqMockup2, {}, {});

            result1.view.should.equal('_index_rows');
            result2.view.should.equal('_pagination');
        });

    });

    describe('buildSqlCriteria', function() {

        it('should return a criteria object for sql', function() {

            var reqMockup = {
                query: {}
            };

            var result = dg.buildSqlCriteria(reqMockup, {}, {});

            result.view.should.equal('index');
            result.limit.should.equal(25);
            result.offset.should.equal(0);
            result.page.should.equal(1);
            result.pageSizes.should.eql([10, 25, 50, 100]);
            result.where.should.equal('(deleted_at IS NULL)');
        });

        it('should return a criteria object with the correct where clause for sql with non-fuzzy searching', function() {

            var reqMockup = {
                query: {
                    search: 'mySearchTerm',
                    sprop : 'mySearchColumn'
                }
            };

            var optsMockup = {
                properties: ['mySearchColumn']
            };

            var result = dg.buildSqlCriteria(reqMockup, {}, optsMockup);

            result.where.should.equal('(mySearchColumn LIKE \'%mySearchTerm%\') AND (deleted_at IS NULL)');
        });

        it('should return a criteria object with the correct where clause for sql with fuzzy searching', function() {

            // WIP

            var reqMockup = {
                query: {
                    search : 'mySearchTerm',
                    sprop  : 'fuzzy'
                }
            };

            var optsMockup = {
                properties  : ['mySearchColumn'],
                wherePrefix : ''
            };

            var result = dg.buildSqlCriteria(reqMockup, {}, optsMockup);

            result.where.should.equal('(mySearchColumn LIKE \'%mySearchTerm%\') AND (deleted_at IS NULL)');
        });
    });
});

