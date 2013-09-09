var should = require('should');
var path   = require('path');
var root   = path.resolve('./');

describe('tests for the store', function() {
    
    var Store   = null;
    var myStore = null;
    
    beforeEach(function() {
        Store = require(root + '/lib/store');
    });
    
    afterEach(function() {
        Store = null;
        myStore = null;
    });
    
    describe('constructor', function() {
        
        it('should register namespaces passed in as argument via the constructor', function() {
            var namespaces         = ['checkMe', 'lookAtThis', 'ohWow'];
            var namespacesExpected = namespaces.slice(0);
            
            namespacesExpected.push('default');
            
            myStore = new Store(namespaces);
            
            myStore.namespaces.should.have.keys(namespacesExpected);
        });
        
        it('should always have a default namespace', function() {
            var namespaces = ['checkMe', 'lookAtThis', 'ohWow'];

            myStore = new Store(namespaces);
            
            should.exist(myStore.namespaces.default);
        });
        
        it('should only have a default namespace when nothing was passed to the constructor', function() {
            myStore = new Store();
            
            myStore.namespaces.should.have.keys('default');
        });
    });
    
    describe('getter', function() {
        it('should get a value which was set without providing a namespace', function() {
            myStore = new Store();
            
            myStore.set('fiz', 'buz');
            
            myStore.get('fiz').should.equal('buz');
            myStore.get('default', 'fiz').should.equal('buz');
        });
        
        it('should get a value which was set providing a namespace', function() {
            myStore = new Store(['customSpace']);
            
            myStore.set('customSpace', 'foo', 'bar');
            
            myStore.get('customSpace', 'foo').should.equal('bar');
        });
        
        
        //it('should return undefined when accessing an undefined namespace', function() {
            
            // current version of store throws a typeerror, this should be fixed first
        //});
    });
    
});