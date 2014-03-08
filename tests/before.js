/**
 * Hooks which are executed before starting the tests.
 *
 * @author Nabil Krause <nabil.krause@silberlicht.eu>
 */

function before(skipCreateProject)
{
    createExampleProject(skipCreateProject);
};

function createExampleProject(skip)
{
    if (skip) {
        console.log('Skipping creation of example project...');
        return;
    }

    console.log('Trying to setup example project...');

    var paths       = require('./paths');
    var TestProject = require('./helper/project.js');
    var tp          = new TestProject(paths.exampleProject);
    var code;

    tp.showOutput = true;

    code = tp.createProjectSync();

    if (code !== 0) {
        throw new Error('Could not setup example project!');
    }

    console.log('Successfully setup example project!');
};

module.exports = before;

