'use strict';

// Dependencies
const strings = require('core-functions/strings');
const isNotBlank = strings.isNotBlank;
const isString = strings.isString;
const trim = strings.trim;
const stringify = strings.stringify;

const copying = require('core-functions/copying');
const copy = copying.copy;
const merging = require('core-functions/merging');
const merge = merging.merge;

const booleans = require('core-functions/booleans');
const isBoolean = booleans.isBoolean;

const levelPrefixedRegex = /\s*(ERROR|WARN|INFO|DEBUG|TRACE|LOG)(?:$|([^A-Za-z]+.*))/;

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
 * The default logging configuration uses the following settings:
 * - Log level is set to logLevel from the local default-options.json file (if any); otherwise to defaults.logLevel (currently LogLevel.INFO)
 * - Use level prefixes is set to useLevelPrefixes from the local default-options.json file (if any); otherwise to defaults.useLevelPrefixes (currently true)
 * - The log level environment variable name is set to envLogLevelName from the local default-options.json file (if any); otherwise to defaults.envLogLevelName (currently 'LOG_LEVEL')
 * - The underlying logger is set to console
 * - Use console trace is set to useConsoleTrace from the local default-options.json file (if any); otherwise to defaults.useConsoleTrace (currently false)
 *
 * Primary usage:
 * - First configure logging on an existing object (do this once, during start-up)
 *    const context = {...}; // an existing object to configure with logging functionality
 *    configureLogging(context, {logLevel: LogLevel.DEBUG});
 *
 * - Then later use the configured object to do logging, for example:
 *    let err = new Error('Some arbitrary error');
 *    context.error('Insert error message here', err);
 *    if (context.warnEnabled) context.warn('Insert warning here');
 *    context.info('FYI');
 *    if (log.debugEnabled) context.debug('Insert debug message here');
 *    context.trace('Some detailed tracing message goes here');
 *
 * Alternative usage:
 * - First configure logging on a new "logger" object (do this once, during start-up):
 *    const settings = {logLevel: LogLevel.WARN, useLevelPrefixes: true, underlyingLogger: console, useConsoleTrace: false};
 *    const log = configureLogging({}, settings, undefined, true);
 *
 * - Then later use the configured object to do logging, for example:
 *    let err = new Error('Some arbitrary error');
 *    log.error('Insert error message here', err);
 *    log.warn('Insert warning here');
 *    if (log.infoEnabled) log.info('FYI');
 *    log.debug('Insert debug message here');
 *    if (log.traceEnabled) log.trace('Some detailed tracing message goes here');
 *
 * @module logging-utils/logging
 * @author Byron du Preez
 */
exports._$_ = '_$_'; //IDE workaround
// Exports
exports.isLoggingConfigured = isLoggingConfigured;
exports.configureLogging = configureLogging;
exports.getDefaultLoggingOptions = getDefaultLoggingOptions;
exports.log = log;
exports.isValidLogLevel = isValidLogLevel;
exports.cleanLogLevel = cleanLogLevel;
exports.isMinimumViableLogger = isMinimumViableLogger;
// exports.FOR_TESTING_ONLY = {loadDefaultLoggingOptions, toLoggingSettingsWithDefaults}

function noop() {
}

/**
 * An enum for the various logging levels supported
 * @enum {string}
 * @readonly
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};
Object.freeze(LogLevel);
exports.LogLevel = LogLevel;

/**
 * The last-resort, default options to fallback to during configuration to fill in any missing settings
 * @type LoggingOptions
 */
const defaults = {
  logLevel: LogLevel.INFO,
  useLevelPrefixes: true,
  envLogLevelName: 'LOG_LEVEL',
  useConsoleTrace: false
};


/**
 * Returns true, if the given target already has logging functionality configured on it; otherwise returns false.
 * @param {Object} target the target object to check
 * @return {*} true if configured; otherwise false
 */
function isLoggingConfigured(target) {
  return target && isBoolean(target.warnEnabled) && isBoolean(target.infoEnabled) && isBoolean(target.debugEnabled)
    && isBoolean(target.traceEnabled) && typeof target.error === 'function' && typeof target.warn === 'function'
    && typeof target.info === 'function' && typeof target.debug === 'function' && typeof target.trace === 'function';
}

/**
 * Configures the given target object with logging functionality using the given logging settings (if any) and/or
 * options (if any), preferring valid individual settings over valid options and using default settings to fill in any
 * missing settings, but ONLY if forceConfiguration is true or if there is no logging functionality already configured
 * on the target object.
 *
 * Returns the target object updated with the following:
 * - Four enabled flags (warnEnabled, infoEnabled, debugEnabled and traceEnabled), which can be used to check whether
 *   warn, info, debug or trace level logging is enabled or not (and thus avoid the overhead of even building the
 *   message to be logged, if the level is not enabled); and
 * - Five logging methods (error, warn, info, debug & trace), which simply delegate the actual logging to the
 *   underlying logger.
 * - A convenience log method, which expects a log level as its first argument and delegates the logging to the
 *   appropriate one of the five logging method according to the log level
 *
 * Note that you can call any of the 5 logging functions without first checking the corresponding enabled flag and the
 * function will simply do nothing if its log level is not enabled.
 *
 * @param {Object|Logger} target - the target object to configure with logging functionality
 * @param {LoggingSettings|LoggingOptions|undefined} [settings] - optional logging settings to use
 * @param {LoggingOptions|undefined} [options] - optional logging options to use when no corresponding setting is provided
 * @param {boolean|undefined} [forceConfiguration] - whether or not to force configuration of the logging functionality,
 * which will override any previously configured logging functionality on the target object
 * @returns {Logger} the given target object with logging functionality configured
 */
function configureLogging(target, settings, options, forceConfiguration) {
  // If forceConfiguration is false check if the given target already has logging functionality configured on it
  // and, if so, do nothing more and simply return the target as is (to prevent overriding an earlier configuration)
  if (!forceConfiguration && isLoggingConfigured(target)) {
    return target;
  }

  // Ensure that any underlying logger to be configured is a minimum viable logger
  //noinspection JSUnresolvedVariable
  const logger = settings && settings.underlyingLogger ? settings.underlyingLogger :
    options && options.underlyingLogger ? options.underlyingLogger : undefined;
  if (logger && !isMinimumViableLogger(logger)) {
    const errMsg = `FATAL - Cannot configure logging with a logger that is NOT a minimum viable logger - logger: ${stringify(logger)}`;
    console.error(errMsg);
    throw new Error(errMsg);
  }

  // Create clean copies of the given settings and options
  settings = toCleanSettingsOrOptions(settings);
  options = toCleanSettingsOrOptions(options);

  // Resolve the logging settings to use by merging the clean options (if any) into the clean settings (if any) without
  // replacing any existing clean settings
  const loggingSettings = settings ? (options ? merge(options, settings) : settings) : options;

  // Finalise the logging settings by using the default options to fill in any missing settings
  const defaultOptions = getDefaultLoggingOptions();
  const loggingSettingsWithDefaults = loggingSettings ?
    merge(defaultOptions, loggingSettings) : defaultOptions;

  // Configure logging with the finalised logging settings
  _configureLogging(target, loggingSettingsWithDefaults);
  return target;
}

/**
 * Configures the given target object with logging functionality using the given logging settings.
 * @param {Object} target the target object to which to add the logging functionality
 * @param {LoggingSettings} settings - the logging settings to configure
 * @returns {Logger} the updated target object with logging functionality configured
 * @private
 */
function _configureLogging(target, settings) {
  const envLogLevelName = settings.envLogLevelName;

  // If a logLevel is configured in the named environment variable then use it instead
  const envLogLevel = process.env[envLogLevelName];
  const logLevel = isValidLogLevel(envLogLevel) ? cleanLogLevel(envLogLevel) : settings.logLevel;

  const useLevelPrefixes = settings.useLevelPrefixes;
  const useConsoleTrace = settings.useConsoleTrace;
  const logger = isMinimumViableLogger(settings.underlyingLogger) ? settings.underlyingLogger : console;

  // Finalise the underlying logging methods to be used
  const usingConsole = logger === console;
  const hasInfoMethod = usingConsole || typeof logger.info === 'function';
  const hasLogMethod = usingConsole || typeof logger.log === 'function';

  if (!hasLogMethod && !hasInfoMethod) {
    throw new Error(`FATAL: Cannot configure logging with an underlying logger that has neither a log method nor an info method - logger (${stringify(logger)})`);
  }
  if (!hasLogMethod) {
    console.warn('WARNING - The configured underlying logger has NO log method - falling back to using its info method');
  }
  if (!hasInfoMethod) {
    console.warn('WARNING - The configured underlying logger has NO info method - falling back to using its log method');
  }

  // Use log level to determine which levels are enabled
  const traceEnabled = logLevel === LogLevel.TRACE;
  const debugEnabled = traceEnabled || logLevel === LogLevel.DEBUG;
  const infoEnabled = debugEnabled || logLevel === LogLevel.INFO;
  const warnEnabled = infoEnabled || logLevel === LogLevel.WARN;

  // Resolve logger's error method
  const error = resolveLoggingFunction(logger, 'error', useLevelPrefixes, 'ERROR');

  // Resolve logger's warn method, but fallback to using logger.error if it has no logger.warn method
  const warnFnName = usingConsole ? 'warn' : typeof logger.warn === 'function' ? 'warn' : 'error';
  const warn = warnEnabled ? resolveLoggingFunction(logger, warnFnName, useLevelPrefixes, 'WARN') : noop;

  // Resolve logger's info method, but fallback to using logger.log if it has no logger.info
  const infoFnName = usingConsole ? 'info' : typeof logger.info === 'function' ? 'info' : 'log';
  const info = infoEnabled ? resolveLoggingFunction(logger, infoFnName, useLevelPrefixes, 'INFO') : noop;

  // Resolve logger's debug method, but fallback to using infoFnName if it has no logger.debug method
  const debugFnName = usingConsole ? 'info' : typeof logger.debug === 'function' ? 'debug' : infoFnName;
  const debug = debugEnabled ? resolveLoggingFunction(logger, debugFnName, useLevelPrefixes, 'DEBUG') : noop;

  // Resolve logger's trace method, but fallback to using debugFnName if it has no logger.trace method
  const traceFnName = usingConsole ? useConsoleTrace ? 'trace' : 'info' :
    typeof logger.trace === 'function' ? 'trace' : debugFnName;
  const trace = traceEnabled ? resolveLoggingFunction(logger, traceFnName, useLevelPrefixes, 'TRACE') : noop;

  // Resolve logger's log method, but fallback to using logger.info if it has no logger.log method, which is NOT
  // technically a proper replacement for a log method, but nevertheless ...
  // To enable the underlying logger's log method's output to ALSO be suppressed, treat it as if it logs at INFO level
  // (i.e. it will be suppressed if infoEnabled is false), but prefix it with 'LOG' instead of 'INFO' (to distinguish it
  // from INFO logging output) when useLevelPrefixes is true
  const logFnName = usingConsole ? 'log' : typeof logger.log === 'function' ? 'log' : infoFnName;
  const log = infoEnabled ? resolveLoggingFunction(logger, logFnName, useLevelPrefixes, 'LOG') : noop;

  // Add the logging functionality to the given target object
  target.logLevel = logLevel; // for info and testing purposes
  target._underlyingLogger = logger; // for testing purposes ONLY
  target.warnEnabled = warnEnabled;
  target.infoEnabled = infoEnabled;
  target.debugEnabled = debugEnabled;
  target.traceEnabled = traceEnabled;
  target.error = error;
  target.warn = warn;
  target.info = info;
  target.debug = debug;
  target.trace = trace;
  target.log = extendLogFunction(target, log);

  target.debug(`Logging configured with level ${logLevel}, with${useLevelPrefixes ? '' : 'out'} prefixes, with env log level name '${envLogLevelName}' & with${useConsoleTrace ? '' : 'out'} console.trace`);

  return target;
}

/**
 * Loads a clean, but potentially incomplete, copy of the default logging options from the local default-options.json file.
 * @returns {LoggingOptions|undefined} clean (potentially incomplete) copy of default options loaded from the local file
 */
function loadDefaultLoggingOptions() {
  return toCleanSettingsOrOptions(require('./default-options.json'));
}

/**
 * Returns a clean and complete copy of the default logging options, which are a combination of the options loaded from
 * the local default-options.json file and the static defaults, which are used to fill in any missing options.
 * @returns {LoggingOptions} the complete and clean default options
 */
function getDefaultLoggingOptions() {
  const defaultOptions = loadDefaultLoggingOptions();
  return defaultOptions ? merge(defaults, defaultOptions) : copy(defaults);
}

/**
 * Returns a clean copy of the given logging options or settings WITHOUT any invalid properties and with a clean
 * logLevel (if it has a valid logLevel) if optionsOrSettings is a non-null object; otherwise returns undefined.
 * @param {LoggingOptions|LoggingSettings|undefined|*} [optionsOrSettings] - optional logging options or settings
 * @returns {LoggingOptions|LoggingSettings|undefined} a clean copy of the given logging options or settings (if any) or undefined
 */
function toCleanSettingsOrOptions(optionsOrSettings) {
  if (!optionsOrSettings || typeof optionsOrSettings !== 'object') return undefined;

  const cleaned = optionsOrSettings ? copy(optionsOrSettings) : {};

  if (isValidLogLevel(cleaned.logLevel)) {
    cleaned.logLevel = cleanLogLevel(cleaned.logLevel);
  } else {
    delete cleaned.logLevel;
  }
  if (!isBoolean(cleaned.useLevelPrefixes)) {
    delete cleaned.useLevelPrefixes;
  }
  if (isNotBlank(cleaned.envLogLevelName)) {
    cleaned.envLogLevelName = cleaned.envLogLevelName.trim();
  } else {
    delete cleaned.envLogLevelName;
  }
  if (!isBoolean(cleaned.useConsoleTrace)) {
    delete cleaned.useConsoleTrace;
  }
  if (cleaned.underlyingLogger && !isMinimumViableLogger(cleaned.underlyingLogger)) {
    console.warn('Skipping configured underlying logger, since it is NOT a minimum viable logger');
    delete cleaned.underlyingLogger;
  }
  return cleaned;
}

/**
 * Returns true if the given log level is a valid logging level; otherwise returns false.
 * @param {LogLevel|string|undefined} [logLevel] - the optional log level to validate
 * @returns {boolean} true if a valid logging level; false otherwise
 */
function isValidLogLevel(logLevel) {
  const level = cleanLogLevel(logLevel);
  switch (level) {
    case LogLevel.ERROR:
    case LogLevel.WARN:
    case LogLevel.INFO:
    case LogLevel.DEBUG:
    case LogLevel.TRACE:
      return true;
    default:
      return false;
  }
}

/**
 * Cleans the given log level (if any) by trimming it and converting it to uppercase.
 * @param {LogLevel} logLevel
 * @returns {LogLevel} the cleaned log level
 */
function cleanLogLevel(logLevel) {
  return logLevel && logLevel.trim ? logLevel.trim().toUpperCase() : logLevel;
}

/**
 * Extracts the log level prefix (if any) and returns it and the rest of the input; otherwise returns undefined and the
 * original input.
 * @param {string|*} input - the input to split
 * @returns {[(LogLevel|undefined), (string|*)]} an array containing the log level (if extracted) or undefined followed
 * by the rest of the input trimmed (if level was extracted) or the original input
 */
function extractLogLevelAndRest(input) {
  const match = levelPrefixedRegex.exec(input);
  if (!match) return [undefined, input];
  return [match[1], trim(match[2])];
}

/**
 * Checks whether the given logger is either console or a minimum viable logger-like object, which means that it must
 * have AT LEAST a `log` method and an `error` method.
 * @param {Logger|BasicLogger|*} logger - the logger to be checked
 * @returns {boolean} true if console or a valid (minimum viable) logger-like object; false otherwise
 */
function isMinimumViableLogger(logger) {
  return logger === console || (logger && typeof logger.log === 'function' && typeof logger.error === 'function');
}

/**
 * Resolves the given logger's named logging function, binds it to the given logger and then either returns the bound
 * function (if `useLogLevelPrefix` is false) or wraps it in a function that will also prepend the given
 * `logLevelPrefix` to any first argument before invoking the bound function.
 * @param {Logger|BasicLogger} logger - the underlying logger from which the logging function originates
 * @param {string} loggingFnName - the name of the logger's logging function to use
 * @param {boolean} useLogLevelPrefix - whether the returned function must prepend the given log-level prefix to its first argument or not
 * @param {string} logLevelPrefix - the prefix to prepend
 * @return {logWithPrefix} a bound and possibly prefix pre-pending logging function that delegates to the named & bound logging function
 */
function resolveLoggingFunction(logger, loggingFnName, useLogLevelPrefix, logLevelPrefix) {
  // Bind the relevant log function to its appropriate logger
  const loggingFn = logger[loggingFnName].bind(logger);

  // Note that we skip adding a prefix when using console.trace, since it already includes its own prefix 'Trace: '
  if (!useLogLevelPrefix || (logger === console && loggingFnName === 'trace')) {
    return loggingFn;
  }

  function logWithPrefix() {
    if (arguments.length > 0) {
      const arg0 = arguments[0];
      if (!isString(arg0) || !arg0.startsWith(logLevelPrefix)) {
        arguments[0] = `${logLevelPrefix} ${arg0 instanceof Error && arg0.stack ? arg0.stack : arg0}`;
      }
    }
    return loggingFn.apply(null, arguments); // prior bind takes precedence over any apply (so just apply with null)
  }

  return logWithPrefix;
}

/**
 * A convenience function that delegates the logging to the log method of either the given logger (if its defined and
 * has a log or info method) or to console (if not)
 * @param {Logger|BasicLogger|undefined} [logger] - the optional logger to use
 * @param {...*} data - zero or more data items to be logged
 */
function log(logger, data) {
  // Collect all arguments other than logger
  const len = arguments.length;
  if (len <= 0) {
    console.log();
    return;
  }
  const args = new Array(len - 1);
  for (let i = 1; i < len; ++i) {
    args[i - 1] = arguments[i];
  }
  // If a logger was provided & it has a log method, then use it
  if (logger && typeof logger.log === 'function') {
    logger.log.apply(logger, args);
  } else if (logger && typeof logger.info === 'function') {
    // If a logger was provided & it has a info method, then use it
    logger.info.apply(logger, args);
  } else {
    // otherwise use console
    console.log.apply(console, args);
  }
}

/**
 * Generates an extended log function that will delegate the logging to the appropriate logging function based on an
 * extracted log level prefix (if any & if its valid) and otherwise default to using the given log function.
 * @param {Logger} target - the target object onto which logging functionality is being installed
 * @param {function(...*)} log - the wrapped and bound underlying logger's log method
 * @returns {function(...data)} an extended version of the given log function
 */
function extendLogFunction(target, log) {
  /**
   * An extension of the conventional log method that first checks if the first argument contains a valid log level and
   * if so instead delegates the call to the appropriate logging function for the specified log level (passing the rest
   * of the first argument (if any) and all arguments after the first argument to it); or otherwise simply delegates the
   * log call to the underlying logger's log method passing ALL of the original arguments to it.
   * @param {...*} data - zero or more data items to be logged - with special meaning assigned to the first argument by
   * this function and also possibly by the underlying logger's log method (e.g. see console.log)
   */
  function logAtLevel(data) {
    const self = this || target;
    // If NO arguments were passed, then delegate a no-arg call to the given logger log function
    const len = arguments.length;
    if (len <= 0) {
      log();
      return;
    }
    const [logLevel, rest] = extractLogLevelAndRest(arguments[0]);

    let args;
    if (!logLevel) {
      // No log level, so use all arguments passed as is
      args = arguments;
    } else if (rest) {
      // First argument contained MORE than just a log level, so use the rest of the first argument as the first argument
      args = arguments;
      args[0] = rest;
    } else {
      // First argument ONLY contained a log level, so drop the first argument
      args = new Array(len - 1);
      for (let i = 1; i < len; ++i) {
        args[i - 1] = arguments[i];
      }
    }

    switch (logLevel) {
      case LogLevel.ERROR:
        self.error.apply(null, args);
        return;

      case LogLevel.WARN:
        self.warn.apply(null, args);
        return;

      case LogLevel.INFO:
        self.info.apply(null, args);
        return;

      case LogLevel.DEBUG:
        self.debug.apply(null, args);
        return;

      case LogLevel.TRACE:
        self.trace.apply(null, args);
        return;

      case 'LOG':
        log.apply(null, args); // log is already bound to its logger, so ignore thisArg
        return;

      default:
        // If no valid log level was provided as a first argument then default to calling the given logger log function
        // using ALL of the arguments as data
        log.apply(null, arguments); // log is already bound to its logger, so ignore thisArg
        return;
    }
  }

  return logAtLevel;
}