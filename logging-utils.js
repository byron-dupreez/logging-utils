'use strict';

/**
 * Utilities to configure simple log-level based console logging.
 * @module logging-utils/logging-utils
 * @author Byron du Preez
 */

// Dependencies
const strings = require('core-functions/strings');
const isBlank = strings.isBlank;
const isString = strings.isString;

const functions = require('core-functions/functions');
const isFunction = functions.isFunction;
const noop = functions.noop;

const booleans = require('core-functions/booleans');
const isBoolean = booleans.isBoolean;

// Constants for log levels
const ERROR = 'error';
const WARN = 'warn';
const INFO = 'info';
const DEBUG = 'debug';
const TRACE = 'trace';

// Load local configuration
const config = require('./config.json');

const defaultLogLevel = toValidLogLevelOrDefault(config.defaultLogLevel, INFO);
//console.log(`Default logging level set to (${defaultLogLevel})`);

const defaultUseLevelPrefixes = isBoolean(config.defaultUseLevelPrefixes) ? config.defaultUseLevelPrefixes : true;
//console.log(`Default use level prefixes set to (${defaultUseLevelPrefixes})`);

const defaultUseConsoleTrace = isBoolean(config.defaultUseConsoleTrace) ? config.defaultUseConsoleTrace : false;
//console.log(`Default use console.trace set to (${defaultUseConsoleTrace})`);

// Exports
// Constants for Log Levels
module.exports.ERROR = ERROR;
module.exports.WARN = WARN;
module.exports.INFO = INFO;
module.exports.DEBUG = DEBUG;
module.exports.TRACE = TRACE;
module.exports.defaultLogLevel = defaultLogLevel;
// Functions to configure logging
module.exports.isLoggingConfigured = isLoggingConfigured;
module.exports.configureLoggingOn = configureLoggingOn;
module.exports.configureLogging = configureLogging;
module.exports.toValidLogLevelOrDefault = toValidLogLevelOrDefault;

/**
 * Returns true, if the given target already has logging functionality configured on it; otherwise returns false.
 * @param {Object} target the target object to check
 * @return {*} true if configured; otherwise false
 */
function isLoggingConfigured(target) {
  return isBoolean(target.warnEnabled) && isBoolean(target.infoEnabled) && isBoolean(target.debugEnabled)
    && isBoolean(target.traceEnabled) && isFunction(target.error) && isFunction(target.warn)
    && isFunction(target.info) && isFunction(target.debug) && isFunction(target.trace);
}

/**
 * Configures logging on a new object (if forceConfiguration is true or if no logging functionality is already
 * configured on the object), based on the given log level, which should be one of error, warn, info, debug or trace,
 * and then returns the new object with the following:
 * - Four enabled flags (warnEnabled, infoEnabled, debugEnabled and traceEnabled), which can be used to check whether
 *   warn, info, debug or trace level logging is enabled or not (and thus avoid the overhead of even building the
 *   message to be logged, if the level is not enabled); and
 * - Five logging functions (error, warn, info, debug & trace), which simply delegate the actual logging to the
 *   underlying logger.
 *
 * Note that you can call any of the 5 logging functions without first checking the corresponding enabled flag and the
 * function will simply do nothing if its log level is not enabled.
 *
 * The optional logLevel, if defined, sets the level of logging to be used. If undefined, the defaultLogLevel will be
 * used instead.
 *
 * Log levels:
 * - error - only logs at error level
 * - warn - only logs at warn & error levels
 * - info - logs at info, warn & error levels
 * - debug - logs at debug, info, warn & error levels
 * - trace - logs at trace, debug, info, warn & error levels
 *
 * The optional useLevelPrefixes, if defined and either true or false, specifies whether or not to prepend log level
 * prefixes to logged messages. If undefined, the default defaultUseLevelPrefixes will be used instead.
 *
 * The optional underlyingLogger, if defined, determines the underlying logger that will be used to do the actual
 * logging. If defined, the underlyingLogger must have error, warn, info, debug & trace methods; otherwise console will
 * be used as the underlying logger. For AWS Lambdas only console will be used and the underlyingLogger is only
 * currently used for testing the logging functionality.
 *
 * The optional useConsoleTrace, if defined and either true or false, specifies whether or not to use console.trace
 * (true) or console.log (false). If undefined, the defaultUseConsoleTrace will be used instead. However, before setting
 * this to true, be warned that console.trace logs to standard error and ALSO outputs the stack trace, which is
 * generally NOT what you want for the most detailed level of logging.
 *
 * Example usage:
 * const log = configureLogging('info', true, false);
 * let err = new Error('Some arbitrary error');
 * log.error('Insert error message here', err.stack);
 * if (log.warnEnabled) log.warn('Insert warning here');
 * log.info('FYI');
 * if (log.debugEnabled) log.debug('Insert debug message here');
 * log.trace('Some detailed tracing message goes here');
 *
 * @param {string|undefined} logLevel the optional level of logging to configure
 * @param {boolean|undefined} useLevelPrefixes optional whether or not to prepend level prefixes to logged messages
 * @param {Object|undefined} underlyingLogger the optional underlying logger to use to do the actual logging
 * @param {boolean|undefined} useConsoleTrace optional whether or not to use console.trace or console.log for trace
 * level logging
 * @return {{warnEnabled: boolean, infoEnabled: boolean, debugEnabled: boolean, traceEnabled: boolean,
 * error: Function, warn: Function, info: Function, debug: Function, trace: Function}}
 */
function configureLogging(logLevel, useLevelPrefixes, underlyingLogger, useConsoleTrace) {
  return configureLoggingOn({}, logLevel, useLevelPrefixes, underlyingLogger, useConsoleTrace, true);
}

/**
 * Configures logging on the given target object (if forceConfiguration is true or if no logging functionality is
 * already configured on the target), based on the given log level, which should be one of error, warn, info, debug or
 * trace, and then returns the target updated with the following:
 * - Four enabled flags (warnEnabled, infoEnabled, debugEnabled and traceEnabled), which can be used to check whether
 *   warn, info, debug or trace level logging is enabled or not (and thus avoid the overhead of even building the
 *   message to be logged, if the level is not enabled); and
 * - Five logging functions (error, warn, info, debug & trace), which simply delegate the actual logging to the
 *   underlying logger.
 *
 * Note that you can call any of the 5 logging functions without first checking the corresponding enabled flag and the
 * function will simply do nothing if its log level is not enabled.
 *
 * The optional logLevel, if defined, sets the level of logging to be used. If undefined, the defaultLogLevel will be
 * used instead.
 *
 * Log levels:
 * - error - only logs at error level
 * - warn - only logs at warn & error levels
 * - info - logs at info, warn & error levels
 * - debug - logs at debug, info, warn & error levels
 * - trace - logs at trace, debug, info, warn & error levels
 *
 * The optional useLevelPrefixes, if defined and either true or false, specifies whether or not to prepend log level
 * prefixes to logged messages. If undefined, the default defaultUseLevelPrefixes will be used instead.
 *
 * The optional underlyingLogger, if defined, determines the underlying logger that will be used to do the actual
 * logging. If defined, the underlyingLogger must have error, warn, info, debug & trace methods; otherwise console will
 * be used as the underlying logger. For AWS Lambdas only console will be used and the underlyingLogger is only
 * currently used for testing the logging functionality.
 *
 * The optional useConsoleTrace, if defined and either true or false, specifies whether or not to use console.trace
 * (true) or console.log (false). If undefined, the defaultUseConsoleTrace will be used instead. However, before setting
 * this to true, be warned that console.trace logs to standard error and ALSO outputs the stack trace, which is
 * generally NOT what you want for the most detailed level of logging.
 *
 * Example usage:
 * const context = {}
 * configureLoggingOn(context, 'info');
 * let err = new Error('Some arbitrary error');
 * context.error('Insert error message here', err.stack);
 * if (context.warnEnabled) context.warn('Insert warning here');
 * context.info('FYI');
 * if (log.debugEnabled) context.debug('Insert debug message here');
 * context.trace('Some detailed tracing message goes here');
 *
 * @param {Object} target the target object to which to add the logging functionality
 * @param {string|undefined} logLevel the optional level of logging to configure
 * @param {boolean|undefined} useLevelPrefixes optional whether or not to prepend level prefixes to logged messages
 * @param {Object|undefined} underlyingLogger the optional underlying logger to use to do the actual logging
 * @param {boolean|undefined} useConsoleTrace optional whether or not to use console.trace or console.log for trace
 * level logging
 * @param {boolean|undefined} forceConfiguration whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @return {Object} the updated target object
 */
function configureLoggingOn(target, logLevel, useLevelPrefixes, underlyingLogger, useConsoleTrace, forceConfiguration) {
  // If forceConfiguration is false check if the given target already has logging functionality configured on it
  // and, if so, do nothing more and simply return the target as is (to prevent overriding an earlier configuration)
  if (!forceConfiguration && isLoggingConfigured(target)) {
    return target;
  }

  // Finalise the underlying logger
  const logger = isValidLogger(underlyingLogger) ? underlyingLogger : console;

  // Finalise the underlying logging methods to be used
  const loggerInfo = logger === console ? console.log : logger.info;
  const loggerDebug = logger === console ? console.log : logger.debug;

  // Finalise the decision as to whether or not to prepend the log level to logged messages
  const usePrefixes = isBoolean(useLevelPrefixes) ? useLevelPrefixes :
    isBoolean(target.useLevelPrefixes) ? target.useLevelPrefixes : defaultUseLevelPrefixes;

  // Finalise the decision as to whether or not to use console.trace in trace level logging
  const useConsoleTraceFinal = isBoolean(useConsoleTrace) ? useConsoleTrace :
    isBoolean(target.useLevelPrefixes) ? target.useLevelPrefixes : defaultUseConsoleTrace;

  const loggerTrace = logger === console ? useConsoleTraceFinal ? console.trace : console.log : logger.trace;
  const usingConsoleTrace = logger === console && useConsoleTraceFinal;

  // Finalise the log level to be used
  const level = toValidLogLevelOrDefault(logLevel, toValidLogLevelOrDefault(target.logLevel, defaultLogLevel));

  console.log(`Log level set to (${level})`);
  console.log(`Use level prefixes set to (${usePrefixes})`);
  console.log(`Use console.trace set to (${useConsoleTraceFinal})`);

  // Use log level to determine which levels are enabled
  const traceEnabled = level === TRACE;
  const debugEnabled = traceEnabled || level === DEBUG;
  const infoEnabled = debugEnabled || level === INFO;
  const warnEnabled = infoEnabled || level === WARN;

  // Set up the appropriate function to use for logging at each level
  const error = usePrefixes ? withPrefix(logger.error, 'ERROR') : logger.error;
  const warn = warnEnabled ? usePrefixes ? withPrefix(logger.warn, 'WARN') : logger.warn : noop;
  const info = infoEnabled ? usePrefixes ? withPrefix(loggerInfo, 'INFO') : loggerInfo : noop;
  const debug = debugEnabled ? usePrefixes ? withPrefix(loggerDebug, 'DEBUG') : loggerDebug : noop;
  // Note that we skip adding a prefix when using console.trace, since it already includes its own prefix 'Trace: '
  const trace = traceEnabled ? usePrefixes && !usingConsoleTrace ? withPrefix(loggerTrace, 'TRACE') : loggerTrace : noop;

  // Add the logging functionality to the given target object
  target.logLevel = level; // for info and testing purposes
  target.warnEnabled = warnEnabled;
  target.infoEnabled = infoEnabled;
  target.debugEnabled = debugEnabled;
  target.traceEnabled = traceEnabled;
  target.error = error;
  target.warn = warn;
  target.info = info;
  target.debug = debug;
  target.trace = trace;

  return target;
}

/**
 * Cleans up and attempts to match the given log level against a valid log level and if it succeeds returns the cleaned
 * up level; otherwise returns the given default log level.
 * @param {string} logLevel
 * @param {string} defaultLogLevel
 * @returns {*} the given level cleaned (if valid); otherwise the given default log level
 */
function toValidLogLevelOrDefault(logLevel, defaultLogLevel) {
  if (isString(logLevel) && !isBlank(logLevel)) {
    const level = logLevel.trim().toLowerCase();
    switch (level) {
      case ERROR:
      case WARN:
      case INFO:
      case DEBUG:
      case TRACE:
        return level;
      default:
        console.error(`Unexpected logging level (${logLevel}) - defaulting to (${defaultLogLevel}) level logging`);
        return defaultLogLevel;
    }
  }
  return defaultLogLevel;
}

/**
 * Checks whether the given logger is either console or has error, warn, info, debug and trace methods.
 * @param logger the underlying logger to be checked
 * @returns {boolean} true if console or valid; false otherwise
 */
function isValidLogger(logger) {
  return logger === console || (logger && isFunction(logger.error) && isFunction(logger.warn)
    && isFunction(logger.info) && isFunction(logger.debug) && isFunction(logger.trace));
}

/**
 * Returns a function which wraps the given logFn in order to prepend the given level prefix to its first argument when
 * invoked.
 * @param {Function} logFn the logging function to wrap (e.g. console.log, console.error, ...)
 * @param {string} logLevelPrefix the prefix to prepend
 * @return {logWithPrefix} a prefix-prepending function that delegates to the given logFn
 */
function withPrefix(logFn, logLevelPrefix) {
  function logWithPrefix() {
    if (arguments && arguments.length > 0) {
      const arg1 = arguments[0];
      if (arg1 && isString(arg1) && !arg1.startsWith(logLevelPrefix)) {
        arguments[0] = `${logLevelPrefix} ${arg1}`;
      }
    }
    return logFn.apply(console, arguments);
  }

  return logWithPrefix;
}
