/**
 * Tests for lib/helper/config.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should = require('should');
var path   = require('path');
var fs     = require('fs');
var es     = require('execSync');
var root   = path.resolve(__dirname + '/../../../');
var Config = require(root + '/lib/config');
var cg     = null;

describe('config', function() {

    var configPath = '/tmp/greppy/';
    var configFile = 'config.js'

    before(function() {

        es.run('mkdir -p ' + configPath);

        // create config mockup
        fs.writeFileSync(configPath + configFile, 'var config = ' +
            JSON.stringify({
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
            }) +
            ';' +
            'module.exports = config;'
        );
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

        it('should load a config on instanciation when a path property is passed to the constructor', function() {
            cg = new Config({
                path: configPath + configFile
            });

            cg.values.should.be.a('object');
            cg.values.should.have.property('propOne');
            cg.values.propOne.stringProp.should.equal('lorem');
            cg.values.propOne.numProp.should.equal(12);
            cg.values.propOne.arrayProp.should.eql(['yeah', 1]);
            cg.values.should.have.property('propTwo');
            cg.values.propTwo.objProp.should.be.a('object');
            cg.values.propTwo.objProp.boolProp.should.equal(false);
        });
    });


});
