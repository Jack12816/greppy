/**
 * Tests for lib/store.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should  = require('should');
var path    = require('path');
var root    = path.resolve(__dirname + '/../../../');
var Store   = require(root + '/lib/store');
var se      = null;

describe('Store', function() {

    describe('constructor', function() {

        it('should register namespaces passed in as argument via the constructor', function() {
            
            var namespaces         = ['checkMe', 'lookAtThis', 'ohWow'];
            var namespacesExpected = namespaces.slice(0);

            namespacesExpected.push('default');

            se = new Store(namespaces);

            se.namespaces.should.have.keys(namespacesExpected);
        });

        it('should always have a default namespace', function() {

            var namespaces = ['checkMe', 'lookAtThis', 'ohWow'];

            se = new Store(namespaces);

            should.exist(se.namespaces.default);
        });

        it('should only have a default namespace when nothing was passed to the constructor', function() {

            se = new Store();

            se.namespaces.should.have.keys('default');
        });
    });

    describe('getter', function() {
        it('should get a value which was set without providing a namespace', function() {

            se = new Store();

            se.set('fiz', 'buz');

            se.get('fiz').should.equal('buz');
            se.get('default', 'fiz').should.equal('buz');
        });

        it('should get a value which was set providing a namespace', function() {

            se = new Store(['customSpace']);

            se.set('customSpace', 'foo', 'bar');

            se.get('customSpace', 'foo').should.equal('bar');
        });


        it('should return null when accessing an undefined value of an undefined namespace', function() {

            se = new Store();

            var result = se.get('customSpace', 'foo');

            should.strictEqual(result, null);
        });

        it('should return null when accessing an undefined value of a defined namespace', function() {

            var namespaces = ['checkMe', 'lookAtThis', 'ohWow'];

            se = new Store(namespaces);

            var result = se.get('checkMe', 'bar');

            should.strictEqual(result, null);
        });
    });

    describe('setter', function() {
        it('should throw an error if not enough arguments are provided', function() {

            se = new Store();

            (function(){
                se.set('foo');
            }).should.throwError(/.*Arguments.*/);
        });

        it('should throw an error when trying to set a value of an undefined namespace', function() {

            se = new Store();

            (function(){
                se.set('bar', 'foo', 'buz');
            }).should.throwError(/.*Namespace.*/);
        });

        it('should set a value without providing a namespace', function() {

            se = new Store();

            (function(){
                se.set('foo', 'bar');
            }).should.not.throwError();
        });

        it('should set a value within a provided namespace', function() {

            se = new Store(['mySpace']);

            (function(){
                se.set('mySpace', 'foo', 'bar');
            }).should.not.throwError();
        });
    });

    describe('list', function() {

        it('should list all keys in a provided namespace', function() {

            se = new Store(['s1', 's2']);

            se.set('s1', 'myFirstKey', 'myFirstVal');
            se.set('s1', 'mySecondKey', 'mySecondVal');

            se.set('s2', 'firstKey', 'firstVal');
            se.set('s2', 'secondKey', 'secondVal');

            se.set('default', 'firstKeyInDefault', 'firstValInDefault');
            se.set('default', 'secondKeyInDefault', 'secondValInDefault');

            se.list('s1').should.eql(['myFirstKey', 'mySecondKey']);
            se.list('s2').should.eql(['firstKey', 'secondKey']);
            se.list('default').should.eql(['firstKeyInDefault', 'secondKeyInDefault']);

        });

        it('should list all keys of the default namespace if no namespace was provided', function() {

            se = new Store();

            se.set('foo', 'bar');
            se.set('fiz', 'buzz');

            se.list().should.eql(['foo', 'fiz']);
        });

        it('should throw an error if a non-existent namespace was provided', function() {

            se = new Store();

            (function() {
                se.list('foo');
            }).should.throwError(/.*Namespace.*/);
        });
    });
});

