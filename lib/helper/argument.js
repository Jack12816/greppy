/**
 * Argument Helper
 *
 * @module greppy/helper/argument
 * @author Hermann Mayer <hermann.mayer92@gmail.com>
 */

var util = require('util');
var fs   = require('fs');

/**
 * @constructor
 */
var ArgumentHelper = function()
{
};

/**
 * Build a new argument object to process.
 *
 * @param {Array} args - Arguments to analyse
 * @return {Object}
 */
ArgumentHelper.prototype.build = function(args)
{
    return new Argument(args);
};

/**
 * @constructor
 */
var Argument = function(args)
{
    this.args = args;
    this.commands = {
        atomic   : [],
        combined : []
    };
    this.validator = null;
};

/**
 * Define all commands to parse.
 *
 * @param {Object} commands - Commands configuration
 */
Argument.prototype.setCommands = function(commands)
{
    var self = this;

    if (!commands.atomic) {
        throw new Error('You need an atomic command');
    }

    this.commands.atomic = commands.atomic;

    if (!commands.combined) {
        return;
    }

    Object.keys(commands.combined).forEach(function(combinedCommand) {

        commands.combined[combinedCommand].forEach(function(atomicCommand) {

            if (-1 === self.commands.atomic.indexOf(atomicCommand)) {

                throw new Error(
                    'No atomic command "' + command + '" was registerd'
                );
            }
        });
    });

    this.commands.combined = commands.combined;
};

/**
 * Set the validator for all arguments.
 *
 * @param {Function} validator - Validator function
 */
Argument.prototype.setValidator = function(validator)
{
    this.validator = validator;
};

/**
 * Parse the arguments and match up the commands
 * to get a array of commands to run.
 *
 * @return {Array}
 */
Argument.prototype.parse = function()
{
    var self             = this;
    var combinedCommands = Object.keys(this.commands.combined);
    var commands         = this.commands.atomic.concat(combinedCommands);

    var conf      = {};
    var chain     = [];
    var operation = '';

    // Build the command configuration
    this.args.forEach(function(arg) {

        if (-1 !== commands.indexOf(arg)) {

            operation = arg;

            if (-1 !== combinedCommands.indexOf(operation)) {

                self.commands.combined[operation].forEach(function(operation) {

                    conf[operation] = {
                        opts: []
                    };
                });

                return;
            }

            conf[arg] = {
                opts: []
            };

            return;
        }

        if (operation) {

            if (-1 !== combinedCommands.indexOf(operation)) {

                self.commands.combined[operation].forEach(function(operation) {
                    conf[operation].opts.push(arg);
                });

                return;
            }

            conf[operation].opts.push(arg);
        }
    });

    // Remap the command configuration into a chain
    Object.keys(conf).forEach(function(command) {

        if (self.validator) {
            conf[command].opts = self.validator(conf[command].opts);
        }

        chain.push({
            name    : command,
            options : conf[command].opts
        });
    });

    return chain;
};

module.exports = ArgumentHelper;

