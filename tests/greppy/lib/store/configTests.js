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
});

