/**
 * List Command
 *
 * @module greppy/cli/list
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

fs   = require('fs');
util = require('util');

exports.run = function(opts, debug)
{
    // Find a Greppy project recursivly
    commandHelper.findProjectOrDie();

    var contexts = projectHelper.loadContexts(
        projectHelper.listContexts(process.cwd())
    );

    var found        = 0;
    var contextNames = contexts.contexts.map(function(context) {
        return contexts.instance[context].name;
    });

    if (true === debug) {

        var http    = require('http');
        var express = require('express');
        var app     = express();
        var server  = http.createServer(app);
    }

    var printDetails = function(context)
    {
        global.table.writeRow([
            context.name.bold.green,
            context.description.white
        ]);

        global.table.writeRow([
            'modules'.white.bold,
            context.modules.join(', ')
        ]);

        if (false === debug) {
            console.log();
        } else {
            printDebugDetails(context);
        }
    }

    var printDebugDetails = function(context)
    {
        var controllerLoader = new (require('../../lib/http/mvc/loader'))({
            app: app,
            server: server,
            context: context
        });

        controllerLoader.load(context.modules);

        global.table.writeRow([
            'routes'.white.bold,
            ''
        ]);

        // List routes
        projectHelper.formatContextRoutes(context).forEach(function(route) {

            global.table.writeRow([
                ''.white.bold,
                route
            ]);
        });

        console.log();
    }

    if (0 === contextNames.length) {

        console.log('No configured contexts found.');
        return;
    }

    // User filter was given, so we use it
    if (0 !== opts.length) {

        opts.forEach(function(context, oidx) {

            context = contexts.instance[context];

            if (!context) {

                console.log('Context "' + opts[oidx] + '" is not configured.');
                return process.exit();
            }

            printDetails(context);
        });

        return;
    }

    // No user filter was given, so we list all contexts
    contexts.contexts.forEach(function(context) {
        printDetails(contexts.instance[context]);
    });
}

