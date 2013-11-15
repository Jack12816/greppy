/**
 * JSONWspClient Helper
 *
 * @module greppy/helper/service/json-wsp/client
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var extend = require('extend');
var async  = require('async');

/**
 * @constructor
 */
var JSONWspClientHelper = function()
{
};

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
};

/**
 * Perform a request.
 *
 * @param {Object} options - Options for this request
 * @param {String} data - Data to pass on POST requests
 * @param {Function} errorLogger - Function to call on errors
 * @param {Function} callback - Function to call on finish
 */
JSONWspClient.prototype.request = function(options, data, errorLogger, callback)
{
    var chunks  = '';

    var req = this.socket.request(options, function(res) {

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

                // The response was an fault or an error occured
                if (200 !== res.statusCode || 'jsonwsp/fault' === response.type) {

                    return callback && callback(new Error(
                        ((response.fault && response.fault.string) ? response.fault.string : 'UNKNOWN_ERROR')
                    ), null, response, res);
                }

                callback && callback(null, response.result, response, res);

            } catch(e) {

                var err = new Error(
                    'Failed to parse response. Details: ' + e.message + '\n' + chunks
                );

                errorLogger(err);
                callback && callback(err, null, chunks, res);
            }
        });
    });

    // On-error event handler
    req.on('error', function(err) {
        errorLogger(err);
        req.abort();
        callback && callback(err, null, null, null);
    });

    // On-timeout event handler
    req.setTimeout(options.timeout, function() {
        var err = new Error('Request timed out.');
        errorLogger(err);
        req.abort();
    });

    // Send request data
    if ('POST' === options.method) {
        req.write(data);
    }

    req.end();
};

/**
 * Get the JSON-WSP specification.
 *
 * @param {String} path - Path of the specification
 * @param {Function} callback - Function to call on finish
 */
JSONWspClient.prototype.specification = function(path, callback)
{
    var curOpts = {};
    var chunks  = '';

    // Merge given options with default options
    extend(true, curOpts, this.socketOptions);

    // Set the path of the specification
    curOpts.path = path;

    // Set HTTP method for calling
    curOpts.method = 'GET';

    logger.debug(
        'Perform request on JSON-WSP service ' + (
            curOpts.hostname + ':' + curOpts.port +
            curOpts.path + ' -> Specification'
        ).bold.green
    );

    // Default error handler
    var logError = function(err) {

        var message = 'Error occured while performing a JSON-WSP request. ' +
            err.message + '\n' +
            JSON.stringify({
                options : curOpts
            }, null, '  ').yellow;

        logger.error(message);
    };

    this.request(curOpts, null, logError, callback);
};

/**
 * Call an JSON-WSP method.
 *
 * @param {String} method - Name of the method
 * @param {Object} args - Arguments of the method to call
 * @param {Object} [options] - Options for this call
 * @param {Function} callback - Function to call on finish
 */
JSONWspClient.prototype.call = function(method, args, options, callback)
{
    if ('object' !== typeof args) {
        throw new Error('Args needs to be an object.');
    }

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

    // Set HTTP method for calling
    curOpts.method = 'POST';

    // Setup request data
    reqData.methodname = method;
    reqData.args       = args || {};
    reqData.mirror.id  = options.mirror || 1;

    var formatedArgsList = [];

    Object.keys(args).forEach(function(key) {
        formatedArgsList.push(key + ': ' + JSON.stringify(args[key]));
    });

    logger.debug(
        'Perform request on JSON-WSP service ' + (
            curOpts.hostname + ':' + curOpts.port +
            curOpts.path + ' -> ' + method + '(' + formatedArgsList.join(', ') + ')'
        ).bold.green
    );

    // Default error handler
    var logError = function(err) {

        var message = 'Error occured while performing a JSON-WSP request. ' +
            err.message + '\n' +
            JSON.stringify({
                method  : method,
                args    : args,
                options : curOpts
            }, null, '  ').yellow;

        logger.error(message);
    };

    this.request(curOpts, JSON.stringify(reqData), logError, callback);
};

/**
 * Build a JSON-WSP client instance.
 *
 * Example config:
 *   {
 *      hostname: 'localhost',
 *      port: 443,
 *      headers: {'Content-Type': 'application/json; charset=UTF-8'},
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
        path: '/',
        port: 443,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
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
};

module.exports = JSONWspClientHelper;

