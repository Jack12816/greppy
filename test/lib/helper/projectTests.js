var should = require('should');
var path   = require('path');
var root   = path.resolve('./');

describe('project helper', function() {
    
    var validAppPath   = path.resolve('templates/project');
    var invalidAppPath = path.resolve('templates');
    var Project        = null;
    var myProject      = null;
    var curAppPath     = '';
    
    beforeEach(function() {
        Project = require(root + '/lib/helper/project');
        myProject   = new Project();
    });
    
    afterEach(function() {
        Project    = null;
        myProject  = null;
        curAppPath = '';
    });
    
    describe('findAppPath', function() {
    
        it('should find a valid app path', function() {
            curAppPath = validAppPath;
            var result = myProject.findAppPath(curAppPath);
            result.should.have.property('path');
            result.should.have.property('searched');
            result.should.have.property('found', true);
            result.path.should.be.a('string');
            result.searched.should.be.an.instanceOf(Array);
        });

        it('should not find an invalid app path', function() {
            curAppPath = invalidAppPath;
            var result = myProject.findAppPath(curAppPath);
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
            var result = myProject.listContexts(curAppPath);
            result.should.have.property('path');
            result.should.have.property('contexts');
            result.path.should.be.a('string');
            result.contexts.should.be.an.instanceOf(Array);
        });
        
        it('should not find contexts in an invalid project', function() {
            curAppPath = invalidAppPath;
            var result = myProject.listContexts(curAppPath);
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
            var result = myProject.listModules(curAppPath);
            result.should.have.property('path');
            result.should.have.property('modules');
            result.path.should.be.a('string');
            result.path.should.not.be.empty;
            result.modules.should.be.an.instanceOf(Array);
            result.modules.should.include('acme');
        });
        
        it('should not find modules in an invalid project', function() {
            curAppPath = invalidAppPath;
            var result = myProject.listModules(curAppPath);
            result.should.have.property('path');
            result.should.have.property('modules');
            result.path.should.be.a('string');
            result.path.should.not.be.empty;
            result.modules.should.be.empty;
        });
    });
    
    // NOT WORKING YET
    describe('loadContexts', function() {
        
        // not working yet (reason: path issues)
        return;
        
        var contextObject = {};
        
        beforeEach(function() {
            
            // create contextObject mockup
            curAppPath = validAppPath;
            contextObject = myProject.listContexts(curAppPath);
        });
        
        it('instantiate each provided context', function() {
            
        });
        
    });
    
    describe('findStartScript', function() {
        
        it('should find the start script for a valid project', function() {
            curAppPath = validAppPath;
            var result = myProject.findStartScript(curAppPath);
            result.should.be.a('string');
            result.should.not.be.empty;
        });
        
        it('should not find the start script for an invalid project', function() {
            curAppPath = invalidAppPath;
            var result = myProject.findStartScript(curAppPath);
            false.should.equal(result);
        });
    });
    
    describe('listConfigs', function() {
        
        it('should list configs for a valid project', function() {
            curAppPath = validAppPath;
            var result = myProject.listConfigs(curAppPath);
            result.path.should.be.a.string;
            result.configs.should.be.an.instanceOf(Array);
            result.path.should.not.be.empty;
            result.configs.should.include('application');
        });
        
        it('should not list configs for an invalid project', function() {
            curAppPath = invalidAppPath;
            var result = myProject.listConfigs(curAppPath);
            result.path.should.be.a.string;
            result.configs.should.be.an.instanceOf(Array);
            result.configs.should.be.empty;
        });
    });
    
    describe('loadConfigs', function() {
        
        it('should load configs for a valid project', function() {
            curAppPath = validAppPath;
            
            // get config object and configs
            var configObj = myProject.listConfigs(curAppPath);
            var configs   = configObj.configs;
            var result    = myProject.loadConfigs(configObj);
            
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
            var configObj = myProject.listConfigs(curAppPath);
            var result    = myProject.loadConfigs(configObj);
            
            result.path.should.be.a.string;
            result.path.should.not.be.empty;
            result.configs.should.be.an.instanceOf(Array);
            result.configs.should.be.empty;
            result.instance.should.be.a.object;
            result.instance.should.eql({});
        });
    });
    
    // NOT WORKING YET
    describe('listModels', function() {
        
        // not working yet (reason: models need to be generated first)
        return;
        
    });
    
    // NOT WORKING YET
    describe('listModelsForAllModules', function() {
        
        // not working yet (reason: models need to be generated first)
        return;
        
    });
});
