'use strict';

/**
 * Utilities to configure simple log-level based console logging.
 *
 * The log levels supported are the following:
 * - ERROR - only logs error messages
 * - WARN - only logs warning and error messages
 * - INFO - logs info, warning and error messages
 * - DEBUG - logs debug, info, warning and error messages
 * - TRACE - logs trace, debug, info, warning and error messages (i.e. all)
 *
 * @module logging-utils/logging-utils
 * @author Byron du Preez
 */

// Dependencies
const strings = require('core-functions/strings');
const isBlank = strings.isBlank;
const isString = strings.isString;

function noop() {
}

const booleans = require('core-functions/booleans');
const isBoolean = booleans.isBoolean;

// Constants for log levels
const ERROR = 'error';
const WARN = 'warn';
const INFO = 'info';
const DEBUG = 'debug';
const TRACE = 'trace';

// Exports
module.exports = {
  // Functions to configure logging
  /** Returns true, if the given target already has logging functionality configured on it; otherwise returns false. */
  isLoggingConfigured: isLoggingConfigured,
  /** Configures logging on a target object, based on a specified log level. */
  configureLogging: configureLogging,
  /** Configures default logging on a target object. */
  configureDefaultLogging: configureDefaultLogging,
  /** Configure logging on a target object from a given config object */
  configureLoggingFromConfig: configureLoggingFromConfig,

  // Constants for Log Levels
  /** Constant for the ERROR log level */
  ERROR: ERROR,
  /** Constant for the WARN log level */
  WARN: WARN,
  /** Constant for the INFO log level */
  INFO: INFO,
  /** Constant for the DEBUG log level */
  DEBUG: DEBUG,
  /** Constant for the TRACE log level */
  TRACE: TRACE,
};

// Load local configuration
const config = require('./config.json');

const defaultLogLevel = toValidLogLevelOrDefault(config.defaultLogLevel, INFO);
module.exports.defaultLogLevel = defaultLogLevel;

const defaultUseLevelPrefixes = isBoolean(config.defaultUseLevelPrefixes) ? config.defaultUseLevelPrefixes : true;
module.exports.defaultUseLevelPrefixes = defaultUseLevelPrefixes;

const defaultUseConsoleTrace = isBoolean(config.defaultUseConsoleTrace) ? config.defaultUseConsoleTrace : false;
module.exports.defaultUseConsoleTrace = defaultUseConsoleTrace;

/**
 * Returns true, if the given target already has logging functionality configured on it; otherwise returns false.
 * @param {Object} target the target object to check
 * @return {*} true if configured; otherwise false
 */
function isLoggingConfigured(target) {
  return isBoolean(target.warnEnabled) && isBoolean(target.infoEnabled) && isBoolean(target.debugEnabled)
    && isBoolean(target.traceEnabled) && typeof target.error === 'function' && typeof target.warn === 'function'
    && typeof target.info === 'function' && typeof target.debug === 'function' && typeof target.trace === 'function';
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
 * The optional useLevelPrefixes, if defined and either true or false, indicates whether or not to prepend log level
 * prefixes to logged messages; and may or may not be used depending on forceConfiguration (for details see
 * {@linkcode finaliseUseLevelPrefixes}).
 *
 * The optional underlyingLogger, if defined, determines the underlying logger that will be used to do the actual
 * logging. If defined, the underlyingLogger must have error, warn, info, debug & trace methods; otherwise console will
 * be used as the underlying logger. For AWS Lambdas only console will be used and the underlyingLogger is only
 * currently used for testing the logging functionality.
 *
 * The optional useConsoleTrace, if defined and either true or false, indicates whether or not to use console.trace
 * (true) or console.log (false); and may or may not be used depending on forceConfiguration (for details see
 * {@linkcode finaliseUseConsoleTrace}). However, before setting this to true, be warned that console.trace logs to
 * standard error and ALSO outputs the stack trace, which is generally NOT what you want for the most detailed level of
 * logging.
 *
 * Example 1 - primary usage (to configure logging on an existing object):
 * const context = {...}; // an existing object on which to configure logging
 * configureLogging(context, 'info');
 * let err = new Error('Some arbitrary error');
 * context.error('Insert error message here', err.stack);
 * if (context.warnEnabled) context.warn('Insert warning here');
 * context.info('FYI');
 * if (log.debugEnabled) context.debug('Insert debug message here');
 * context.trace('Some detailed tracing message goes here');
 *
 * Example 2 - secondary usage (to configure logging on a new object):
 * const log = configureLogging({}, 'info', true, undefined, false, true);
 * let err = new Error('Some arbitrary error');
 * log.error('Insert error message here', err.stack);
 * log.warn('Insert warning here');
 * if (log.infoEnabled) log.info('FYI');
 * log.debug('Insert debug message here');
 * if (log.traceEnabled) log.trace('Some detailed tracing message goes here');
 *
 * @param {Object} target the target object to which to add the logging functionality
 * @param {string|undefined} [logLevel] - the optional level of logging to configure
 * @param {boolean|undefined} [useLevelPrefixes] - optional whether or not to prepend level prefixes to logged messages
 * @param {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
 * @param {boolean|undefined} [useConsoleTrace] - optional whether or not to use console.trace or console.log for trace level logging
 * @param {boolean|undefined} [forceConfiguration] - whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @return {Object} the updated target object
 */
function configureLogging(target, logLevel, useLevelPrefixes, underlyingLogger, useConsoleTrace, forceConfiguration) {
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
  const useLevelPrefixesFinal = finaliseUseLevelPrefixes(target, useLevelPrefixes, forceConfiguration);

  // Finalise the decision as to whether or not to use console.trace in trace level logging
  const useConsoleTraceFinal = finaliseUseConsoleTrace(target, useConsoleTrace, forceConfiguration);

  const loggerTrace = logger === console ? useConsoleTraceFinal ? console.trace : console.log : logger.trace;
  const usingConsoleTrace = logger === console && useConsoleTraceFinal;

  // Finalise the log level to be used
  const logLevelFinal = finaliseLogLevel(target, logLevel, forceConfiguration);

  console.log(`Logging: Using log level ${logLevelFinal.toUpperCase()}; ${!useLevelPrefixesFinal ? 'NOT using' : 'Using'} level prefixes; ${!useConsoleTraceFinal ? 'NOT using' : 'Using'} console.trace`);

  // Use log level to determine which levels are enabled
  const traceEnabled = logLevelFinal === TRACE;
  const debugEnabled = traceEnabled || logLevelFinal === DEBUG;
  const infoEnabled = debugEnabled || logLevelFinal === INFO;
  const warnEnabled = infoEnabled || logLevelFinal === WARN;

  // Set up the appropriate function to use for logging at each level
  const error = useLevelPrefixesFinal ? withPrefix(logger.error, 'ERROR') : logger.error;
  const warn = warnEnabled ? useLevelPrefixesFinal ? withPrefix(logger.warn, 'WARN') : logger.warn : noop;
  const info = infoEnabled ? useLevelPrefixesFinal ? withPrefix(loggerInfo, 'INFO') : loggerInfo : noop;
  const debug = debugEnabled ? useLevelPrefixesFinal ? withPrefix(loggerDebug, 'DEBUG') : loggerDebug : noop;
  // Note that we skip adding a prefix when using console.trace, since it already includes its own prefix 'Trace: '
  const trace = traceEnabled ? useLevelPrefixesFinal && !usingConsoleTrace ? withPrefix(loggerTrace, 'TRACE') : loggerTrace : noop;

  // Add the logging functionality to the given target object
  target.logLevel = logLevelFinal; // for info and testing purposes
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
 * Configures default logging on the given target object, but ONLY if no logging functionality is already configured on
 * the target.
 *
 * The default configuration uses the following settings:
 * - Log level is set to target.logLevel (if any) or config.logLevel (if any) or INFO.
 * - Use level prefixes is set to target.useLevelPrefixes (if any) or config.useLevelPrefixes (if any) or true.
 * - The underlying logger is set to undefined, which will trigger the use of console for logging.
 * - Use console trace is set to target.useConsoleTrace (if any) or config.useConsoleTrace (if any) or false.
 *
 * @param {Object} target - the target object to which to add default logging functionality
 * @param {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
 * @param {boolean|undefined} [forceConfiguration] - whether or not to force configuration of the default logging
 * functionality, which will override any previously configured logging functionality on the target object
 * @return {Object} the updated target object
 */
function configureDefaultLogging(target, underlyingLogger, forceConfiguration) {
  return configureLogging(target, defaultLogLevel, defaultUseLevelPrefixes, underlyingLogger, defaultUseConsoleTrace,
    forceConfiguration);
}

/**
 * A convenience function to configure logging (see {@linkcode configureLogging}) on the target object from the given
 * config object that ideally contains logLevel, useLevelPrefixes and useConsoleTrace properties with which to
 * configure logging. If the given config is undefined or not an object, then default logging will be configured with
 * the given underlyingLogger and forceConfiguration.
 *
 * @param {Object} target the target object to which to add the logging functionality
 * @param {Object} config - a config object
 * @param {string|undefined} [config.logging.logLevel] - the optional level of logging to configure
 * @param {boolean|undefined} [config.logging.useLevelPrefixes] - optional whether or not to prepend level prefixes to logged messages
 * @param {boolean|undefined} [config.logging.useConsoleTrace] - optional whether or not to use console.trace or console.log for trace level logging
 * @param {string|undefined} [config.logLevel] - the optional level of logging to configure
 * @param {boolean|undefined} [config.useLevelPrefixes] - optional whether or not to prepend level prefixes to logged messages
 * @param {boolean|undefined} [config.useConsoleTrace] - optional whether or not to use console.trace or console.log for trace level logging
 * @param {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
 * @param {boolean|undefined} [forceConfiguration] - whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @return {Object} the updated target object
 */
function configureLoggingFromConfig(target, config, underlyingLogger, forceConfiguration) {
  return config && typeof config === 'object' ?
    config.logging && typeof config.logging === 'object' ?
      configureLoggingFromConfig(target, config.logging, underlyingLogger, forceConfiguration) :
      configureLogging(target, config.logLevel, config.useLevelPrefixes, underlyingLogger, config.useConsoleTrace, forceConfiguration) :
    configureDefaultLogging(target, underlyingLogger, forceConfiguration);
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
  return logger === console || (logger && typeof logger.error === 'function' && typeof logger.warn === 'function'
    && typeof logger.info === 'function' && typeof logger.debug === 'function' && typeof logger.trace === 'function');
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

/**
 * Finalises the log level to be used. If configuration is NOT being forced (the default), prefers the target's logLevel
 * (if defined) over the given logLevel argument (if defined); otherwise vice-versa. Uses defaultLogLevel if neither
 * defined.
 *
 * @param {Object} target the target object on which logging functionality is being configured
 * @param {string|undefined} logLevel the optional level of logging to configure
 * @param {boolean|undefined} forceConfiguration whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @returns {string} the finalised log level to use
 */
function finaliseLogLevel(target, logLevel, forceConfiguration) {
  return !forceConfiguration ?
    toValidLogLevelOrDefault(target.logLevel, toValidLogLevelOrDefault(logLevel, defaultLogLevel)) :
    toValidLogLevelOrDefault(logLevel, toValidLogLevelOrDefault(target.logLevel, defaultLogLevel));
}

/**
 * Finalises the decision as to whether or not to prepend the log level to logged messages. If configuration is NOT
 * being forced (the default), prefers the target's useLevelPrefixes (if defined) over the given useLevelPrefixes
 * argument (if defined); otherwise vice-versa. Uses defaultUseLevelPrefixes if neither defined.
 *
 * @param {Object} target the target object on which logging functionality is being configured
 * @param {boolean|undefined} useLevelPrefixes optional whether or not to prepend level prefixes to logged messages
 * @param {boolean|undefined} forceConfiguration whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @returns {boolean} the finalised decision as to whether or not to use level prefixes or not
 */
function finaliseUseLevelPrefixes(target, useLevelPrefixes, forceConfiguration) {
  return !forceConfiguration ?
    isBoolean(target.useLevelPrefixes) ? target.useLevelPrefixes :
      isBoolean(useLevelPrefixes) ? useLevelPrefixes : defaultUseLevelPrefixes :
    isBoolean(useLevelPrefixes) ? useLevelPrefixes :
      isBoolean(target.useLevelPrefixes) ? target.useLevelPrefixes : defaultUseLevelPrefixes;
}

/**
 * Finalises the decision as to whether or not to use console.trace in trace level logging. If configuration is NOT
 * being forced (the default), prefers the target's useConsoleTrace (if defined) over the given useConsoleTrace argument
 * (if defined); otherwise vice-versa. Uses defaultUseConsoleTrace if neither defined.
 *
 * @param {Object} target the target object to which to add the logging functionality
 * @param {boolean|undefined} useConsoleTrace optional whether or not to use console.trace or console.log for trace
 * level logging
 * @param {boolean|undefined} forceConfiguration whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @returns {boolean} the finalised decision as to whether or not to use console trace for trace logging or not
 */
function finaliseUseConsoleTrace(target, useConsoleTrace, forceConfiguration) {
  return !forceConfiguration ?
    isBoolean(target.useConsoleTrace) ? target.useConsoleTrace :
      isBoolean(useConsoleTrace) ? useConsoleTrace : defaultUseConsoleTrace :
    isBoolean(useConsoleTrace) ? useConsoleTrace :
      isBoolean(target.useConsoleTrace) ? target.useConsoleTrace : defaultUseConsoleTrace;
}

