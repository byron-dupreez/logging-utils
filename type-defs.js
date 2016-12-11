'use strict';

/**
 * @typedef {Object} Logging - logging functionality
 * @property {Function} error - an error-level logging function
 * @property {Function} warn - a warn-level logging function
 * @property {Function} info - an info-level logging function
 * @property {Function} debug - an debug-level logging function
 * @property {Function} trace - a trace-level logging function
 * @property {boolean} warnEnabled - whether warn-level logging is enabled or not
 * @property {boolean} infoEnabled - whether info-level logging is enabled or not
 * @property {boolean} debugEnabled - whether debug-level logging is enabled or not
 * @property {boolean} traceEnabled - whether trace-level logging is enabled or not
 */

/**
 * @typedef {LoggingOptions} LoggingSettings - The logging settings to use for configuring logging functionality
 * @property {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
 *
 * The optional underlyingLogger, if defined, determines the underlying logger that will be used to do the actual
 * logging. If defined, the underlyingLogger must have error, warn, info, debug & trace methods; otherwise console will
 * be used as the underlying logger. For AWS Lambdas, only console will be used and the underlyingLogger is only
 * currently used for testing the logging functionality.
 */

/**
 * @typedef {Object} LoggingOptions - Logging options are a subset of the full (@linkcode LoggingSettings}, which are
 * used to configure ONLY the simple property logging settings (i.e. all except underlyingLogger)
 * @property {string|undefined} [logLevel] - the level of logging to use ('error', 'warn', 'info', 'debug' or 'trace')
 * @property {boolean|undefined} [useLevelPrefixes] - whether to prepend level prefixes to logged messages or not
 * @property {boolean|undefined} [useConsoleTrace] - whether to use console.trace or console.log for trace level logging
 *
 * The optional logLevel, if defined and valid, sets the level of logging to be used. If undefined or invalid, the
 * defaultLogLevel will be used instead.
 *
 * Log levels:
 * - error - only logs at error level
 * - warn - only logs at warn & error levels
 * - info - logs at info, warn & error levels
 * - debug - logs at debug, info, warn & error levels
 * - trace - logs at trace, debug, info, warn & error levels
 *
 * The optional useLevelPrefixes, if defined and either true or false, indicates whether or not to prepend log level
 * prefixes to logged messages.
 *
 * The optional useConsoleTrace, if defined and either true or false, indicates whether to use console.trace (true) or
 * console.log (false) for trace level logging. However, before setting this to true, be warned that console.trace logs
 * to standard error and ALSO outputs the stack trace, which is generally NOT what you want for the most detailed level
 * of logging.
 */
