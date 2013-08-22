/**
 * Greppy Framework Worker
 *
 * @module acme-app/app/worker
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

// Core dependencies
http = require('http');
fs   = require('fs');
util = require('util');

// Express dependencies
var express = require('express');
var app     = express();

// Framework dependencies
greppy     = require('greppy');
var Worker = greppy.get('app.cluster.worker');

// Load the application config if you need to setup
// a default configuration which will be merged by the file
// greppy.config.load(process.cwd() + '/app/config/application.js', 'app', {
//     default: 'key'
// });

// Bootstrap an Express providing HTTP server
var server = http.createServer(app);

// Method to run after the worker was initalized
var postSetup = function()
{
    // Print simple notification
    logger.info('Greppy demo project started.');
};

// Setup the application worker
var worker = new Worker(app, server, {
    title   : 'greppy-acme-worker',
    modules : ['commons'],
    logger  : {
        colors : {debug : 'white'}
    }
}, postSetup);

