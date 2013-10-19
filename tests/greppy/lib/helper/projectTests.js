/**
 * Tests for lib/helper/project.js
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

var should         = require('should');
var path           = require('path');
var root           = path.resolve(__dirname + '/../../../../');
var paths          = require(root + '/tests/paths');
var validAppPath   = path.resolve('templates/project');
var invalidAppPath = path.resolve('templates');
var Project        = require(root + '/lib/helper/project');
var pt             = null;
var curAppPath     = '';

describe('ProjectHelper', function() {

    beforeEach(function() {
        pt = new Project();
    });

    afterEach(function() {
        curAppPath = '';
    });

    describe('findAppPath', function() {

        it('should find a valid app path', function() {

            curAppPath = validAppPath;
            var result = pt.findAppPath(curAppPath);

            result.should.have.property('path');
            result.should.have.property('searched');
            result.should.have.property('found', true);
            result.path.should.be.a('string');
            result.searched.should.be.an.instanceOf(Array);
        });

        it('should not find an invalid app path', function() {

            curAppPath = invalidAppPath;
            var result = pt.findAppPath(curAppPath);

            result.should.have.property('path');
            result.should.have.property('searched');
            result.should.have.property('found', false);
            result.path.should.be.a('string');
            result.searched.should.be.an.instanceOf(Array);
        });
    });

    describe('listContexts', function() {

        it('should find contexts in a valid project', function() {

            curAppPath = validAppPath;
            var result = pt.listContexts(curAppPath);

            result.should.have.property('path');
            result.should.have.property('contexts');
            result.path.should.be.a('string');
            result.contexts.should.be.an.instanceOf(Array);
        });

        it('should not find contexts in an invalid project', function() {

            curAppPath = invalidAppPath;
            var result = pt.listContexts(curAppPath);

            result.should.have.property('path');
            result.should.have.property('contexts');
            result.path.should.be.a('string');
            result.path.should.not.be.empty;
            result.contexts.should.be.an.instanceOf(Array);
            result.contexts.should.be.empty;
        });
    });

    describe('listModules', function() {

        it('should find modules in a valid project', function() {

            curAppPath = validAppPath;
            var result = pt.listModules(curAppPath);

            result.should.have.property('path');
            result.should.have.property('modules');
            result.path.should.be.a('string');
            result.path.should.not.be.empty;
            result.modules.should.be.an.instanceOf(Array);
            result.modules.should.include('acme');
        });

        it('should not find modules in an invalid project', function() {

            curAppPath = invalidAppPath;
            var result = pt.listModules(curAppPath);

            result.should.have.property('path');
            result.should.have.property('modules');
            result.path.should.be.a('string');
            result.path.should.not.be.empty;
            result.modules.should.be.empty;
        });
    });

    describe('loadContexts', function() {

        var contextObject = {};
        var cwdBak        = process.cwd();

        beforeEach(function() {
            curAppPath = paths.exampleProject;

            // create contextObject mockup
            contextObject = pt.listContexts(curAppPath);
        });

        afterEach(function() {
            process.chdir(cwdBak);
        });

        it('should instantiate each provided context', function() {

            process.chdir(curAppPath);
            var contexts = contextObject.contexts;
            var result   = pt.loadContexts(contextObject);

            result.should.have.property('path');
            result.should.have.property('contexts');
            result.should.have.property('instance');

            contexts.forEach(function(item, idx) {

                result.instance.should.have.property(item);
                result.instance[item].should.have.property('name');
                result.instance[item].should.have.property('description');
                result.instance[item].should.have.property('backends');
                result.instance[item].should.have.property('modules');
                result.instance[item].should.have.property('controllers');
                result.instance[item].should.have.property('routes');
            });
        });
    });

    describe('findStartScript', function() {

        it('should find the start script for a valid project', function() {

            curAppPath = validAppPath;
            var result = pt.findStartScript(curAppPath);

            result.should.be.a('string');
            result.should.not.be.empty;
        });

        it('should not find the start script for an invalid project', function() {

            curAppPath = invalidAppPath;
            var result = pt.findStartScript(curAppPath);

            false.should.equal(result);
        });
    });

    describe('listConfigs', function() {

        it('should list configs for a valid project', function() {

            curAppPath = validAppPath;
            var result = pt.listConfigs(curAppPath);

            result.path.should.be.a.string;
            result.configs.should.be.an.instanceOf(Array);
            result.path.should.not.be.empty;
            result.configs.should.include('application');
        });

        it('should not list configs for an invalid project', function() {

            curAppPath = invalidAppPath;
            var result = pt.listConfigs(curAppPath);

            result.path.should.be.a.string;
            result.configs.should.be.an.instanceOf(Array);
            result.configs.should.be.empty;
        });
    });

    describe('loadConfigs', function() {

        it('should load configs for a valid project', function() {

            curAppPath = validAppPath;

            // get config object and configs
            var configObj = pt.listConfigs(curAppPath);
            var configs   = configObj.configs;
            var result    = pt.loadConfigs(configObj);

            configs.forEach(function(config) {
                should.exist(result.instance[config]);
                result.instance[config].should.be.a('object');
                should.exist(result.instance[config].infrastructure);
                result.instance[config].infrastructure.should.be.a('object');
            });
        });

        it('should not load configs for an invalid project', function() {

            curAppPath = invalidAppPath;

            // get config object
            var configObj = pt.listConfigs(curAppPath);
            var result    = pt.loadConfigs(configObj);

            result.path.should.be.a.string;
            result.path.should.not.be.empty;
            result.configs.should.be.an.instanceOf(Array);
            result.configs.should.be.empty;
            result.instance.should.be.a.object;
            result.instance.should.eql({});
        });
    });

    // NOT WORKING YET
    describe.skip('listModels', function() {

        // not working yet (reason: models need to be generated first)

    });

    // NOT WORKING YET
    describe.skip('listModelsForAllModules', function() {

        // not working yet (reason: models need to be generated first)

    });
});

