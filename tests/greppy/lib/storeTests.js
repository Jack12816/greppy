/**
 * Tests for lib/helper/store.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var root   = path.resolve('./');

describe('store', function() {

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


        it('should return null when accessing an undefined value of an undefined namespace', function() {
            myStore = new Store();

            var result = myStore.get('customSpace', 'foo');

            should.strictEqual(result, null);
        });

        it('should return null when accessing an undefined value of a defined namespace', function() {
            var namespaces = ['checkMe', 'lookAtThis', 'ohWow'];

            myStore = new Store(namespaces);

            var result = myStore.get('checkMe', 'bar');

            should.strictEqual(result, null);
        });
    });

    describe('setter', function() {
        it('should throw an error if not enough arguments are provided', function() {
            myStore = new Store();

            (function(){
                myStore.set('foo');
            }).should.throwError(/.*Arguments.*/);
        });

        it('should throw an error when trying to set a value of an undefined namespace', function() {
            myStore = new Store();

            (function(){
                myStore.set('bar', 'foo', 'buz');
            }).should.throwError(/.*Namespace.*/);
        });

        it('should set a value without providing a namespace', function() {
            myStore = new Store();

            (function(){
                myStore.set('foo', 'bar');
            }).should.not.throwError();
        });

        it('should set a value within a provided namespace', function() {
            myStore = new Store(['mySpace']);

            (function(){
                myStore.set('mySpace', 'foo', 'bar');
            }).should.not.throwError();
        });
    });

    describe('list', function() {
        it('should list all keys in a provided namespace', function() {
            myStore = new Store(['s1', 's2']);

            myStore.set('s1', 'myFirstKey', 'myFirstVal');
            myStore.set('s1', 'mySecondKey', 'mySecondVal');

            myStore.set('s2', 'firstKey', 'firstVal');
            myStore.set('s2', 'secondKey', 'secondVal');

            myStore.set('default', 'firstKeyInDefault', 'firstValInDefault');
            myStore.set('default', 'secondKeyInDefault', 'secondValInDefault');

            myStore.list('s1').should.eql(['myFirstKey', 'mySecondKey']);
            myStore.list('s2').should.eql(['firstKey', 'secondKey']);
            myStore.list('default').should.eql(['firstKeyInDefault', 'secondKeyInDefault']);

        });

        it('should list all keys of the default namespace, if no namespace was provided', function() {
            myStore = new Store();

            myStore.set('foo', 'bar');
            myStore.set('fiz', 'buzz');

            myStore.list().should.eql(['foo', 'fiz']);
        });

        it('should throw an error if a non-existent namespace was provided', function() {
            myStore = new Store();

            (function() {
                myStore.list('foo');
            }).should.throwError(/.*Namespace.*/);
        });
    });
});

