/**
 * Tests for /lib/helper/controller/data-grid
 * 
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should     = require('should');
var path       = require('path');
var root       = path.resolve('./');
var DataGrid   = require(root + '/lib/helper/controller/data-grid');
var dg   = null;

describe('Data-Grid', function() {
    
    beforeEach(function() {
        
        dg = new DataGrid();
    });
    
    describe('buildCriteria', function() {
        
        it('should return a critertia object with default values, if the req has no special values', function() {
            
            var reqMockup = {
                query: {}
            };
            
            var result = dg.buildCriteria(reqMockup, {}, {});
            
            result.view.should.equal('index');
            result.limit.should.equal(25);
            result.offset.should.equal(0);
            result.page.should.equal(1);
            result.pageSizes.should.eql([10, 25, 50, 100]);
        });
        
        it('should should return a criteria object with special values, if options were passed', function() {
            
            var reqMockup = {
                query: {}
            };
            
            var result = dg.buildCriteria(reqMockup, {}, {
                limit: 123,
                pageSizes: [1, 2, 3, 4]
            })
            
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
            
            var result = dg.buildCriteria(reqMockup, {}, {});
            
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

            var result1 = dg.buildCriteria(reqMockup1, {}, {});
            var result2 = dg.buildCriteria(reqMockup2, {}, {});
            
            result1.view.should.equal('_index_rows');
            result2.view.should.equal('_pagination');
        });
        
    });
    
    describe('buildSqlCriteria', function() {
        
        it('should build sql criteria for searching', function() {
            
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
    });
});

