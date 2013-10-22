/**
 * Tests for lib/store/config.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should      = require('should');
var path        = require('path');
var fs          = require('fs');
var es          = require('execSync');
var extend      = require('extend');
var root        = path.resolve(__dirname + '/../../../../');
var paths       = require(root + '/tests/paths');
var ConfigStore = require(root + '/lib/store/config');
var cs          = null;

describe('ConfigStore', function() {

    var configPath    = paths.temp + '/';
    var configFile    = 'configStore.js';
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

        it.skip('should call the constructor of it\'s parent class', function() {

            cs = new ConfigStore();

            should.deepEqual(cs.path, null); // TODO: why is path undefined?!
            cs.default.should.eql({});
            cs.values.should.eql({});
        });

    });

    describe('load', function() {

        it('should throw an error if no path was given', function() {

            cs = new ConfigStore();

            (function() {
                cs.load();
            }).should.throwError(/path/i);
        });

        it('should throw an error if no key was given', function() {

            cs = new ConfigStore();

            (function() {
                cs.load('/path/mockup');
            }).should.throwError(/key/i);
        });

        it('should load a config and save it to a specified key', function() {

            cs = new ConfigStore();

            cs.load(configPath + configFile, 'myConfig');

            var result = cs.get('myConfig');

            result.path.should.equal(configPath + configFile);
            result.default.should.eql({});
            result.values.should.eql(configMockup);
        });

        it('should pass a provided options object to the config', function() {

            cs = new ConfigStore();

            cs.load(configPath + configFile, 'myOtherConfig', {
                default: defaultMockup
            });

            var result = cs.get('myOtherConfig');

            result.path.should.equal(configPath + configFile);
            result.default.should.eql(defaultMockup);
            result.values.should.eql(extend({}, defaultMockup, configMockup));
        });
    });

    describe('new', function() {

        it('should throw an error if no key was given', function() {

            cs = new ConfigStore();

            (function() {
                cs.new();
            }).should.throwError(/key/i);
        });

        it('should load a config and save it to the specified key if a path was given in options', function() {

            cs = new ConfigStore();

            cs.new('myKey', {
                path: configPath + configFile
            });

            var result = cs.get('myKey');

            result.values.should.eql(configMockup);
            result.default.should.eql({});
            result.path.should.equal(configPath + configFile);
        });

        it('should accept default values and values passed via options', function() {

            cs = new ConfigStore();

            cs.new('lorem', {
                values: configMockup,
                default: defaultMockup
            });

            var result = cs.get('lorem');

            result.default.should.eql(defaultMockup);
            result.values.should.eql(extend({}, defaultMockup, configMockup));
        });
    });
});

