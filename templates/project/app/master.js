/**
 * Greppy Framework Master
 *
 * @module acme-app/app/master
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

// Core dependencies
fs   = require('fs');
util = require('util');

// Framework dependencies
greppy     = require('greppy');
var Master = greppy.get('app.cluster.master');

// Greppy Master options
var options = {
    title   : 'greppy-acme-master',
    logger  : {
        colors : {debug : 'white'}
    },
    worker: {
        amount : 1
    }
};

// Setup the application master
var master = new Master(options);

master.configure(options, function() {
    // Post configure hook
});

