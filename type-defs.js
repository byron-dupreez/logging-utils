'use strict';

/**
 * @typedef {Object} Logger - a logger object with logging functionality
 * @property {function(data: ...*)} error - an error-level logging method
 * @property {function(data: ...*)} warn - a warn-level logging method
 * @property {function(data: ...*)} info - an info-level logging method
 * @property {function(data: ...*)} debug - an debug-level logging method
 * @property {function(data: ...*)} trace - a trace-level logging method
 * @property {function(data: ...*)} log - a logging method that delegates to the others if given a valid logLevel as first argument; otherwise uses its underlying logger's log method (if any) or info method (if none)
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
 * logging. If defined, the underlyingLogger must be either console or a minimum viable logger-like object, which means
 * that it must have
 * an error method and a warn methods and must have EITHER an info method OR a log method OR both.have error, warn, info, debug & trace methods; otherwise console will
 * be used as the underlying logger. For AWS Lambdas, only console will be used and the underlyingLogger is only
 * currently used for testing the logging functionality.
 */

/**
 * @typedef {Object} LoggingOptions - Logging options are a subset of the full LoggingSettings, which are used to
 * configure ONLY the simple property logging settings (i.e. all except underlyingLogger)
 * @property {LogLevel|undefined} [logLevel] - the level of logging to use (see LogLevel enum)
 * @property {boolean|undefined} [useLevelPrefixes] - whether to prepend level prefixes to logged messages or not
 * @property {string|undefined} [envLogLevelName] - the name of the environment variable in which to look for a configured log level (e.g. 'LOG_LEVEL')
 * @property {boolean|undefined} [useConsoleTrace] - whether to use console.trace or console.log for trace level logging
 *
 * The logLevel option sets the level of logging to be used. If undefined or invalid, the default logLevel (currently
 * LogLevel.INFO) will be used instead.
 *
 * Log levels:
 * - ERROR - only logs on error calls (i.e. suppresses warn, info, debug & trace calls)
 * - WARN - only logs on warn & error calls (i.e. suppresses info, debug & trace calls)
 * - INFO - logs on info, warn & error calls (i.e. suppresses only debug & trace calls)
 * - DEBUG - logs on debug, info, warn & error levels (i.e. suppresses only trace calls)
 * - TRACE - logs on trace, debug, info, warn & error calls (i.e. does NOT suppress any logging calls)
 *
 * The useLevelPrefixes option indicates whether or not to prepend log level prefixes to logged messages.
 *
 * The useConsoleTrace option indicates whether to use console.trace (true) or console.log (false) for trace level
 * logging. However, before setting this to true, be warned that console.trace logs to standard error and ALSO outputs
 * the stack trace, which is generally NOT what you want for the most detailed level of logging.
 */
