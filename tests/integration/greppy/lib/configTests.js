/**
 * Tests for lib/config.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var fs     = require('fs');
var es     = require('execSync');
var extend = require('extend');
var root   = path.resolve(__dirname + '/../../../../');
var paths  = require(root + '/tests/paths');
var Config = require(root + '/lib/config');
var cg     = null;

describe('Config', function() {

    var configPath    = paths.temp + '/';
    var configFile    = 'config.js';
    var configMockup  = {
        propOne: {
            stringProp: 'lorem',
            numProp: 12,
            arrayProp: ['yeah', 1]
        },
        propTwo: {
            objProp: {
                boolProp: false
            }
        }
    };
    var defaultMockup = {
        defaultProp: 'justSomeText',
        defaultProp2: {
            myTest: true
        }
    };

    before(function() {

        es.run('mkdir -p ' + configPath);

        // create config mockup
        fs.writeFileSync(configPath + configFile, 'var config = ' +
            JSON.stringify(configMockup) +
            ';' +
            'module.exports = config;'
        );
    });

    describe('constructor', function() {

        it('should take an options object and apply it\'s values over it\'s default values', function() {

            cg = new Config({
                values  : configMockup,
                default : defaultMockup
            });

            cg.values.should.eql(extend({}, defaultMockup, configMockup));
            cg.default.should.eql(defaultMockup);
        });
    });

    describe('load', function() {

        it('should throw an error if no path was provided', function() {

            cg = new Config({});

            (function() {
                cg.load();
            }).should.throwError(/path/);
        });

        it('should throw an error if a wrong path was provided', function() {

            cg = new Config({});

            (function() {
                cg.load('/i/made/this/one/up.js');
            }).should.throwError(/does not exist/);
        });

        it('should load a config on instantiation when a path property is passed to the constructor', function() {

            cg = new Config({
                path: configPath + configFile
            });

            cg.values.should.eql(configMockup);
        });

        it('should load a config when it\'s path is provided as parameter', function() {

            cg = new Config({});

            cg.load(configPath + configFile);

            cg.values.should.eql(configMockup);
        });
    });

    describe('get', function() {

        it('should return null if no matching property exists', function() {

            cg = new Config({});

            should.deepEqual(null, cg.get('meow'));
        });

        it('should return the property matching the passed key', function() {

            cg = new Config({
                path: configPath + configFile
            });

            var result1 = cg.get('propOne');
            var result2 = cg.get('propTwo');

            result1.should.eql(configMockup.propOne);
            result2.should.eql(configMockup.propTwo);
        });

        it('should return the whole config if no argument was passed', function() {

            cg = new Config({
                path: configPath + configFile
            });

            cg.get().should.eql(configMockup);
        });
    });

    describe('set', function() {

        it('should throw an error if an undefined value was passed as value', function() {

            cg = new Config({
                path: configPath + configFile
            });

            (function() {
                cg.set('bla', undefined);
            }).should.throwError(/not specified/);
        });

        it('should set a config key to the passed value', function() {

            cg = new Config({
                path: configPath + configFile
            });

            cg.set('propOne', 'wohoo');
            cg.set('fancy', ['orly']);

            var result1 = cg.get('propOne');
            var result2 = cg.get('fancy');

            result1.should.equal('wohoo');
            result2.should.eql(['orly']);
        });

        it('should set the whole config if only one argument was passed', function() {

            var newConfig = {
                yeah: {
                    myProp: 'bla'
                }
            };

            cg = new Config({
                path: configPath + configFile
            });

            cg.set(newConfig);

            cg.get().should.eql(newConfig);
        });

        it('should overwrite the default config with a provided one', function() {

            var userConfig = {
                defaultProp: ['okay'],
                yo: {
                    awesome: 'yes'
                }
            };

            var expected = extend({}, defaultMockup, userConfig);

            cg = new Config({
                path: configPath + configFile
            });

            cg.setDefault(defaultMockup);
            cg.set(userConfig);

            cg.get().should.eql(expected);
        });
    });

    describe('setDefault', function() {

        it('should throw an error if no arguments are passed', function() {

            cg = new Config({
                path: configPath + configFile
            });

            (function() {
                cg.setDefault();
            }).should.throwError(/not specified/);
        });

        it('should set a default config if one was passed as argument', function() {

            cg = new Config({
                path: configPath + configFile
            });

            cg.setDefault(defaultMockup);

            cg.getDefault().should.eql(defaultMockup);
        });
    });

    describe('getDefault', function() {

        it('should return an empty object if no default config was specified', function() {

            cg = new Config({
                path: configPath + configFile
            });

            cg.getDefault().should.eql({});
        });

        it('should return a default config if one was specified', function() {

            cg = new Config({
                path: configPath + configFile
            });

            cg.setDefault(defaultMockup);

            cg.getDefault().should.eql(defaultMockup);
        });
    });

    describe('merge', function() {

        var userConfig = {
            userProp: 'alright',
            defaultProp2: {
                xyz: false
            }
        };

        it('should deep-merge a user defined config over the default config by default', function() {

            var expected = extend(true, {}, defaultMockup, userConfig);

            cg = new Config({
                path: configPath + configFile
            });

            cg.setDefault(defaultMockup);
            cg.merge(userConfig);

            cg.get().should.eql(expected);
        });

        it('should undeep-merge a user defined config over the default config if deep is set to false', function() {

            var expected = extend(false, {}, defaultMockup, userConfig);

            cg = new Config({
                path: configPath + configFile
            });

            cg.setDefault(defaultMockup);
            cg.merge(userConfig, false);

            cg.get().should.eql(expected);
        });

        it('should deep-merge a user defined config over the default config if deep is set to true', function() {

            var expected = extend(true, {}, defaultMockup, userConfig);

            cg = new Config({
                path: configPath + configFile
            });

            cg.setDefault(defaultMockup);
            cg.merge(userConfig, true);

            cg.get().should.eql(expected);
        });
    });
});
