/**
 * JSONWspClient Helper
 *
 * @module greppy/helper/service/json-wsp/client
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var extend = require('extend');
var async = require('async');

/**
 * @constructor
 */
var JSONWspClientHelper = function()
{
}

/**
 * @constructor
 */
var JSONWspClient = function(protocol, socketOptions)
{
    this.socket = require(protocol);
    this.socketOptions = socketOptions;

    this.requestTemplate = {
        "type": "jsonwsp/request",
        "version": "1.0",
        "methodname": null,
        "args": {},
        "mirror": {
            "id": null
        }
    };
}

/**
 * Call an JSON-WSP method.
 *
 * @param {String} method - Name of the method
 * @param {Object} args - Arguments of the method to call
 * @param {Object} [options] - Options for this call
 * @param {Function} callback - Function to call on finish
 * @return void
 */
JSONWspClient.prototype.call = function(method, args, options, callback)
{
    if ('function' === typeof options) {
        callback = options;
        options = {};
    }

    var curOpts = {};
    var chunks  = '';
    var reqData = {};

    // Merge given options with default options
    extend(true, curOpts, this.socketOptions, options);

    // Build request data object
    extend(true, reqData, this.requestTemplate);

    // Setup request data
    reqData.methodname = method;
    reqData.args       = args || {};
    reqData.mirror.id  = options.mirror || 1;

    // Default error handler
    var logError = function(err) {

        var message = 'Error occured while performing a JSON-WSP request. '
            + err.message + '\n'
            + JSON.stringify({
                method  : method,
                args    : args,
                options : curOpts
            }, null, '  ').yellow;

        logger.error(message);
    };

    var req = this.socket.request(curOpts, function(res) {

        // Set the default charset of the response data
        res.setEncoding('utf8');

        // On-data event, just append the response data to our buffer
        res.on('data', function(chunk) {
            if (chunk) {
                chunks += chunk;
            }
        });

        // On-end event, just parse the response
        res.on('end', function() {

            try {

                var response = JSON.parse(chunks);
                callback && callback(null, response.result, response);

            } catch(e) {

                var err = new Error(
                    'Failed to parse response. Details: ' + e.message + '\n'
                    + chunks
                );

                logError(err);
                callback && callback(err);
            }
        });
    });

    // On-error event handler
    req.on('error', function(err) {
        logError(err);
        req.abort();
        callback && callback(err);
    });

    // On-timeout event handler
    req.setTimeout(curOpts.timeout, function() {
        var err = new Error('Request timed out.');
        logError(err);
        req.abort();
        callback && callback(err);
    });

    // Send request data
    req.write(JSON.stringify(reqData));
    req.end();
}

/**
 * Build a JSON-WSP client instance.
 *
 * Example config:
 *   {
 *      hostname: 'localhost',
 *      port: 443,
 *      headers: {'Content-Type': 'application/json; charset=UTF-8'},
 *      method: 'POST',
 *      protocol: 'https',
 *      path: '/test?version=1',
 *      timeout: 10
 *   }
 *
 * @param {Object} config - Config of the client
 * @return {Object}
 */
JSONWspClientHelper.prototype.build = function(config)
{
    var defaultConfig = {
        port: 443,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        method: 'POST',
        protocol: 'https',
        timeout: 10 * 1000
    };

    // Merge the given config to the default config
    extend(true, defaultConfig, config);

    // Extract the protocol property
    var protocol = defaultConfig.protocol;
    delete defaultConfig.protocol;

    // Build the JSON-WSP client
    return new JSONWspClient(protocol, defaultConfig);
}

module.exports = JSONWspClientHelper;

