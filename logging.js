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
 * @module logging-utils/logging
 * @author Byron du Preez
 */

// Dependencies
const strings = require('core-functions/strings');
const isBlank = strings.isBlank;
const isString = strings.isString;
//const stringify = strings.stringify;

const Objects = require('core-functions/objects');

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
  /** Configures a target object with logging functionality using given logging settings (if any) or using default logging settings partially overridden by given logging options (if any) */
  configureLogging: configureLogging,
  /** Configures a target object with logging functionality based on given logging settings */
  configureLoggingWithSettings: configureLoggingWithSettings,
  /** Configures a target object with default logging functionality partially overridden with given logging options */
  configureDefaultLogging: configureDefaultLogging,
  /** Returns a logging settings object constructed from given or default logging options and the given underlyingLogger */
  getDefaultLoggingSettings: getDefaultLoggingSettings,

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

/**
 * @typedef {Object} LoggingSettings - The logging settings to use for configuring logging functionality
 * @property {string|undefined} [logLevel] - the level of logging to use ('error', 'warn', 'info', 'debug' or 'trace')
 * @property {boolean|undefined} [useLevelPrefixes] - whether to prepend level prefixes to logged messages or not
 * @property {boolean|undefined} [useConsoleTrace] - whether to use console.trace or console.log for trace level logging
 * @property {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
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
 * The optional underlyingLogger, if defined, determines the underlying logger that will be used to do the actual
 * logging. If defined, the underlyingLogger must have error, warn, info, debug & trace methods; otherwise console will
 * be used as the underlying logger. For AWS Lambdas, only console will be used and the underlyingLogger is only
 * currently used for testing the logging functionality.
 *
 * The optional useConsoleTrace, if defined and either true or false, indicates whether to use console.trace (true) or
 * console.log (false) for trace level logging. However, before setting this to true, be warned that console.trace logs
 * to standard error and ALSO outputs the stack trace, which is generally NOT what you want for the most detailed level
 * of logging.
 */

/**
 * @typedef {Object} LoggingOptions - Logging options are a subset of the full (@linkcode LoggingSettings}, which are
 * used to configure ONLY the simple property logging settings (i.e. all except underlyingLogger)
 * @property {string|undefined} [logLevel] - the level of logging to use ('error', 'warn', 'info', 'debug' or 'trace')
 * @property {boolean|undefined} [useLevelPrefixes] - whether to prepend level prefixes to logged messages or not
 * @property {boolean|undefined} [useConsoleTrace] - whether to use console.trace or console.log for trace level logging
 */

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
 * Configures the given target object with logging functionality using the given logging settings (if any) or using
 * default logging settings partially overridden by the given logging options (if any), but ONLY if forceConfiguration
 * is true or if there is no logging functionality already configured on the target object.
 * @param {Object} target - the context to configure with logging
 * @param {LoggingSettings|undefined} [settings] - optional logging settings to use
 * @param {LoggingOptions|undefined} [options] - optional logging options to use if no logging settings provided
 * @param {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
 * @param {boolean|undefined} [forceConfiguration] - whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @returns {Object} the given target object
 */
function configureLogging(target, settings, options, underlyingLogger, forceConfiguration) {
  // Check if logging was already configured
  const loggingWasConfigured = isLoggingConfigured(target);

  // Determine the logging settings to be used
  const loggingSettingsAvailable = settings && typeof settings === 'object';
  const loggingOptionsAvailable = options && typeof options === 'object';
  const loggingSettings = loggingSettingsAvailable ?
    loggingOptionsAvailable ? Objects.merge(options, settings, false, false) : settings :
    getDefaultLoggingSettings(options, underlyingLogger);

  // Configure logging with the given or derived logging settings
  configureLoggingWithSettings(target, loggingSettings, forceConfiguration);

  // Log a warning if no settings and no options were provided and the default settings were applied
  if (!loggingSettingsAvailable && (!options || typeof options !== 'object') && (forceConfiguration || !loggingWasConfigured)) {
    target.warn(`Logging was configured without settings or options - used default logging configuration (${JSON.stringify(loggingSettings)})`);
  }
  return target;
}

/**
 * Configures logging functionality on the given target object, but ONLY if forceConfiguration is true or if there is no
 * logging functionality already configured on the target, based on the given logging settings and returns the target
 * updated with the following:
 * - Four enabled flags (warnEnabled, infoEnabled, debugEnabled and traceEnabled), which can be used to check whether
 *   warn, info, debug or trace level logging is enabled or not (and thus avoid the overhead of even building the
 *   message to be logged, if the level is not enabled); and
 * - Five logging functions (error, warn, info, debug & trace), which simply delegate the actual logging to the
 *   underlying logger.
 *
 * Note that you can call any of the 5 logging functions without first checking the corresponding enabled flag and the
 * function will simply do nothing if its log level is not enabled.
 *
 * Example 1 - primary usage (to configure logging on an existing object):
 * const context = {...}; // an existing object on which to configure logging
 * configureLoggingWithSettings(context, {logLevel: 'info'});
 * let err = new Error('Some arbitrary error');
 * context.error('Insert error message here', err.stack);
 * if (context.warnEnabled) context.warn('Insert warning here');
 * context.info('FYI');
 * if (log.debugEnabled) context.debug('Insert debug message here');
 * context.trace('Some detailed tracing message goes here');
 *
 * Example 2 - secondary usage (to configure logging on a new object):
 * const settings = {logLevel: 'info', useLevelPrefixes: true, underlyingLogger: console, useConsoleTrace: false};
 * const log = configureLoggingWithSettings({}, settings, true);
 * let err = new Error('Some arbitrary error');
 * log.error('Insert error message here', err.stack);
 * log.warn('Insert warning here');
 * if (log.infoEnabled) log.info('FYI');
 * log.debug('Insert debug message here');
 * if (log.traceEnabled) log.trace('Some detailed tracing message goes here');
 *
 * @param {Object} target the target object to which to add the logging functionality
 * @param {LoggingSettings|undefined} [settings] - the optional logging settings to configure
 * @param {boolean|undefined} [forceConfiguration] - whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @return {Object} the updated target object
 */
function configureLoggingWithSettings(target, settings, forceConfiguration) {
  // If forceConfiguration is false check if the given target already has logging functionality configured on it
  // and, if so, do nothing more and simply return the target as is (to prevent overriding an earlier configuration)
  if (!forceConfiguration && isLoggingConfigured(target)) {
    return target;
  }
  // Use the given settings (if any) or the default settings (if any missing)
  const underlyingLogger = settings && typeof settings === 'object' ? settings.underlyingLogger : undefined;
  const loggingSettings = getDefaultLoggingSettings(settings, underlyingLogger);

  const logLevel = loggingSettings.logLevel;
  const useLevelPrefixes = loggingSettings.useLevelPrefixes;
  const useConsoleTrace = loggingSettings.useConsoleTrace;
  const logger = loggingSettings.underlyingLogger;

  // Finalise the underlying logging methods to be used
  const loggerInfo = logger === console ? console.log : logger.info;
  const loggerDebug = logger === console ? console.log : logger.debug;

  const loggerTrace = logger === console ? useConsoleTrace ? console.trace : console.log : logger.trace;
  const usingConsoleTrace = logger === console && useConsoleTrace;

  // Use log level to determine which levels are enabled
  const traceEnabled = logLevel === TRACE;
  const debugEnabled = traceEnabled || logLevel === DEBUG;
  const infoEnabled = debugEnabled || logLevel === INFO;
  const warnEnabled = infoEnabled || logLevel === WARN;

  // Set up the appropriate function to use for logging at each level
  const error = useLevelPrefixes ? withPrefix(logger.error, 'ERROR') : logger.error;
  const warn = warnEnabled ? useLevelPrefixes ? withPrefix(logger.warn, 'WARN') : logger.warn : noop;
  const info = infoEnabled ? useLevelPrefixes ? withPrefix(loggerInfo, 'INFO') : loggerInfo : noop;
  const debug = debugEnabled ? useLevelPrefixes ? withPrefix(loggerDebug, 'DEBUG') : loggerDebug : noop;
  // Note that we skip adding a prefix when using console.trace, since it already includes its own prefix 'Trace: '
  const trace = traceEnabled ? useLevelPrefixes && !usingConsoleTrace ? withPrefix(loggerTrace, 'TRACE') : loggerTrace : noop;

  // Add the logging functionality to the given target object
  target.logLevel = logLevel; // for info and testing purposes
  target.warnEnabled = warnEnabled;
  target.infoEnabled = infoEnabled;
  target.debugEnabled = debugEnabled;
  target.traceEnabled = traceEnabled;
  target.error = error;
  target.warn = warn;
  target.info = info;
  target.debug = debug;
  target.trace = trace;

  target.info(`Logging configured with level ${logLevel.toUpperCase()}, with${useLevelPrefixes ? '' : 'out'} level prefixes & with${useConsoleTrace ? '' : 'out'} console.trace`);

  return target;
}

/**
 * Configures the default logging functionality on the given target object partially overridden by the given logging
 * options (if any), but ONLY if no logging functionality is already configured on the target.
 *
 * The default logging configuration uses the following settings:
 * - Log level is set to the local config.loggingOptions.logLevel (if any) or INFO.
 * - Use level prefixes is set to the local config.loggingOptions.useLevelPrefixes (if any) or true.
 * - The underlying logger is set to the given underlyingLogger (if valid) otherwise to console.
 * - Use console trace is set to the local config.loggingOptions.useConsoleTrace (if any) or false.
 *
 * @param {Object} target - the target object to which to add default logging functionality
 * @param {LoggingOptions|undefined} [options] - optional logging options to use to override the default options
 * @param {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
 * @param {boolean|undefined} [forceConfiguration] - whether or not to force configuration of the default logging
 * functionality, which will override any previously configured logging functionality on the target object
 * @return {Object} the updated target object
 */
function configureDefaultLogging(target, options, underlyingLogger, forceConfiguration) {
  const settings = getDefaultLoggingSettings(options, underlyingLogger);
  return configureLoggingWithSettings(target, settings, forceConfiguration);
}

/**
 * Returns the default logging settings either partially or fully overridden by the given logging options (if any) and
 * the given underlyingLogger (if any).
 *
 * This function is used internally by {@linkcode configureLogging}, {@linkcode configureLoggingWithSettings} and
 * {@linkcode configureDefaultLogging}, but could also be used in custom configurations to get the default settings as a
 * base to be overridden with your custom settings before calling {@linkcode configureLogging}.
 *
 * @param {LoggingOptions|undefined} [options] - optional logging options to use to override the default options
 * @param {Object|undefined} [underlyingLogger] - the optional underlying logger to use to do the actual logging
 * @returns {LoggingSettings} a logging settings object
 */
function getDefaultLoggingSettings(options, underlyingLogger) {
  const logger = isValidLogger(underlyingLogger) ? underlyingLogger : console;

  // Check if all of the options were provided, and if so use them instead of looking up defaults
  const optionsAvailable = options && typeof options === 'object';
  if (optionsAvailable && isValidLogLevel(options.logLevel) && isBoolean(options.useLevelPrefixes)
    && isBoolean(options.useConsoleTrace)) {
    return {
      logLevel: options.logLevel.trim().toLowerCase(),
      useLevelPrefixes: options.useLevelPrefixes,
      useConsoleTrace: options.useConsoleTrace,
      underlyingLogger: logger
    };
  }
  // Either no options are available or missing some options, so load local default logging options
  const config = require('./config.json');
  const defaultLogLevel = toValidLogLevelOrDefault(config.loggingOptions.logLevel, INFO);

  const defaultUseLevelPrefixes = isBoolean(config.loggingOptions.useLevelPrefixes) ?
    config.loggingOptions.useLevelPrefixes : true;

  const defaultUseConsoleTrace = isBoolean(config.loggingOptions.useConsoleTrace) ?
    config.loggingOptions.useConsoleTrace : false;

  // If no options are available, then return the default logging options
  if (!optionsAvailable) {
    return {
      logLevel: defaultLogLevel,
      useLevelPrefixes: defaultUseLevelPrefixes,
      useConsoleTrace: defaultUseConsoleTrace,
      underlyingLogger: logger
    }
  }
  // Some options are available, so return a combination of the available options and the default options (where missing)
  return {
    logLevel: toValidLogLevelOrDefault(options.logLevel, defaultLogLevel),
    useLevelPrefixes: isBoolean(options.useLevelPrefixes) ? options.useLevelPrefixes : defaultUseLevelPrefixes,
    useConsoleTrace: isBoolean(options.useConsoleTrace) ? options.useConsoleTrace : defaultUseConsoleTrace,
    underlyingLogger: logger
  };
}

/**
 * Cleans up and attempts to match the given log level against a valid logging level and if it succeeds returns the
 * corresponding logging level; otherwise returns the given default logging level.
 * @param {string|undefined} [logLevel] - the optional log level to validate
 * @param {string} defaultLogLevel
 * @returns {string} the corresponding logging level (if valid); otherwise the given default logging level
 */
function toValidLogLevelOrDefault(logLevel, defaultLogLevel) {
  if (isString(logLevel) && !isBlank(logLevel)) {
    if (isValidLogLevel(logLevel)) {
      return logLevel.trim().toLowerCase();
    }
    console.warn(`Unexpected logging level (${logLevel}) - defaulting to (${defaultLogLevel}) level logging`);
    return defaultLogLevel;
  }
  return defaultLogLevel;
}

/**
 * Returns true if the given log level is a valid logging level; otherwise returns false.
 * @param {string|undefined} [logLevel] - the optional log level to validate
 * @returns {boolean} true if a valid logging level; false otherwise
 */
function isValidLogLevel(logLevel) {
  if (isString(logLevel) && !isBlank(logLevel)) {
    const level = logLevel.trim().toLowerCase();
    switch (level) {
      case ERROR:
      case WARN:
      case INFO:
      case DEBUG:
      case TRACE:
        return true;
      default:
        return false;
    }
  }
  return false;
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