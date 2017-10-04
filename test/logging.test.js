'use strict';

/**
 * Unit tests for logging.js
 * @author Byron du Preez
 */

const test = require('tape');

// Load logging utils
const logging = require('../logging.js');
// Valid logging levels
const LogLevel = logging.LogLevel;

// Logging utils functions
const isLoggingConfigured = logging.isLoggingConfigured;
const configureLogging = logging.configureLogging;
const getDefaultLoggingOptions = logging.getDefaultLoggingOptions;
const log = logging.log;
const isMinimumViableLogger = logging.isMinimumViableLogger;

// const booleans = require('core-functions/booleans');
//const isBoolean = booleans.isBoolean;

const strings = require('core-functions/strings');
const isNotBlank = strings.isNotBlank;

const defaultOptions = getDefaultLoggingOptions();

let loggerCount = 0;
function testLogger(logLevel, useConsole, testPrefix, t) {
  ++loggerCount;
  const prefix = isNotBlank(testPrefix) ? `${testPrefix}${loggerCount}` : '';

  function error() {
    //console.log(`IN error() with level (${logLevel.toUpperCase()})`);
    if (prefix && arguments.length > 0) arguments[0] = `${prefix} ${arguments[0]}`;
    console.error.apply(console, arguments);
  }

  function warn() {
    //console.log(`IN warn() with level (${logLevel.toUpperCase()})`);
    if (prefix && arguments.length > 0) arguments[0] = `${prefix} ${arguments[0]}`;
    console.warn.apply(console, arguments);
    if (logLevel === LogLevel.ERROR) t.fail('warn not enabled');
  }

  function info() {
    //console.log(`IN info() with level (${logLevel.toUpperCase()})`);
    if (prefix && arguments.length > 0) arguments[0] = `${prefix} ${arguments[0]}`;
    console.info.apply(console, arguments);
    if (logLevel === LogLevel.ERROR || logLevel === LogLevel.WARN) t.fail('info not enabled');
  }

  function debug() {
    //console.log(`IN debug() with level (${logLevel.toUpperCase()})`);
    if (prefix && arguments.length > 0) arguments[0] = `${prefix} ${arguments[0]}`;
    console.info.apply(console, arguments);
    if (logLevel !== LogLevel.DEBUG && logLevel !== LogLevel.TRACE) t.fail('debug not enabled');
  }

  function trace() {
    //console.log(`IN trace() with level (${logLevel.toUpperCase()})`);
    if (prefix && arguments.length > 0) arguments[0] = `${prefix} ${arguments[0]}`;
    console.info.apply(console, arguments);
    if (logLevel !== LogLevel.TRACE) t.fail('trace not enabled');
  }

  function log() {
    //console.log(`IN info() with level (${logLevel.toUpperCase()})`);
    if (prefix && arguments.length > 0) arguments[0] = `${prefix} ${arguments[0]}`;
    console.log.apply(console, arguments);
    if (logLevel === LogLevel.ERROR || logLevel === LogLevel.WARN) t.fail('info not enabled');
  }

  return useConsole ? console : {
      error: error,
      warn: warn,
      info: info,
      debug: debug,
      trace: trace,
      log: log
    };
}

let counter = 1;

function logOneOfEach(logger, logLevel) {
  logger.error(`*** Error message ${counter} (at level ${logLevel})`, '***'); //, new Error('Boom'));
  logger.warn(`*** Warn message ${counter} (at level ${logLevel})`, '***');
  logger.info(`*** Info message ${counter} (at level ${logLevel})`, '***');
  logger.debug(`*** Debug message ${counter} (at level ${logLevel})`, '***');
  logger.trace(`*** Trace message ${counter} (at level ${logLevel})`, '***');
  logOneOfEachUsingLogMethod(logger, logLevel);
  //++counter;
}

function logOneOfEachUsingLogMethod(logger, logLevel) {
  logger.log(LogLevel.ERROR, `*** Log ERROR message ${counter} (at level ${logLevel})`, '***');
  logger.log(LogLevel.WARN, `*** Log WARN message ${counter} (at level ${logLevel})`, '***');
  logger.log(LogLevel.INFO, `*** Log INFO message ${counter} (at level ${logLevel})`, '***');
  logger.log(LogLevel.DEBUG, `*** Log DEBUG message ${counter} (at level ${logLevel})`, '***');
  logger.log(LogLevel.TRACE, `*** Log TRACE message ${counter} (at level ${logLevel})`, '***');
  logger.log('<<< %s %s >>>', `*** Log "<<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  ++counter;
}

function logOneOfEachUsingLogFunction(logger, logLevel, loggerDesc) {
  log(logger, LogLevel.ERROR, `*** log(${loggerDesc}, ERROR) message ${counter} (at level ${logLevel})`, '***');
  log(logger, LogLevel.WARN, `*** log(${loggerDesc}, WARN) message ${counter} (at level ${logLevel})`, '***');
  log(logger, LogLevel.INFO, `*** log(${loggerDesc}, INFO) message ${counter} (at level ${logLevel})`, '***');
  log(logger, LogLevel.DEBUG, `*** log(${loggerDesc}, DEBUG) message ${counter} (at level ${logLevel})`, '***');
  log(logger, LogLevel.TRACE, `*** log(${loggerDesc}, TRACE) message ${counter} (at level ${logLevel})`, '***');
  log(logger, '<<< %s %s >>>', `*** log(${loggerDesc}, "<<< %s %s >>>") message ${counter} (at level ${logLevel})`, '***');
  ++counter;
}

function logOneOfEachUsingLogMethod2(logger, logLevel) {
  logger.log(`${LogLevel.ERROR} <<< %s %s >>>`, `*** Log "ERROR <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  logger.log(`${LogLevel.WARN} <<< %s %s >>>`, `*** Log "WARN <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  logger.log(`${LogLevel.INFO} <<< %s %s >>>`, `*** Log "INFO <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  logger.log(`${LogLevel.DEBUG} <<< %s %s >>>`, `*** Log "DEBUG <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  logger.log(`${LogLevel.TRACE} <<< %s %s >>>`, `*** Log "TRACE <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  logger.log('<<< %s %s >>>', `*** Log "<<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  ++counter;
}

function logOneOfEachUsingLogFunction2(logger, logLevel, loggerDesc) {
  log(logger, `${LogLevel.ERROR} <<< %s %s >>>`, `*** log(${loggerDesc}, "ERROR <<< %s %s >>>") message ${counter} (at level ${logLevel})`, '***');
  log(logger, `${LogLevel.WARN} <<< %s %s >>>`, `*** log(${loggerDesc}, "WARN <<< %s %s >>>") message ${counter} (at level ${logLevel})`, '***');
  log(logger, `${LogLevel.INFO} <<< %s %s >>>`, `*** log(${loggerDesc}, "INFO <<< %s %s >>>") message ${counter} (at level ${logLevel})`, '***');
  log(logger, `${LogLevel.DEBUG} <<< %s %s >>>`, `*** log(${loggerDesc}, "DEBUG <<< %s %s >>>") message ${counter} (at level ${logLevel})`, '***');
  log(logger, `${LogLevel.TRACE} <<< %s %s >>>`, `*** log(${loggerDesc}, "TRACE <<< %s %s >>>") message ${counter} (at level ${logLevel})`, '***');
  log(logger, '<<< %s %s >>>', `*** log(${loggerDesc}, "<<< %s %s >>>") message ${counter} (at level ${logLevel})`, '***');
  ++counter;
}

function logOneOfEach3(logger, logLevel) {
  const error = logger.error;
  const warn = logger.warn;
  const info = logger.info;
  const debug = logger.debug;
  const trace = logger.trace;
  // Ensure previously bound, by calling without `logger.`
  error(`*** Error message ${counter} (at level ${logLevel})`, '***'); //, new Error('Boom'));
  warn(`*** Warn message ${counter} (at level ${logLevel})`, '***');
  info(`*** Info message ${counter} (at level ${logLevel})`, '***');
  debug(`*** Debug message ${counter} (at level ${logLevel})`, '***');
  trace(`*** Trace message ${counter} (at level ${logLevel})`, '***');
  logOneOfEachUsingLogMethod3(logger, logLevel);
  //++counter;
}

function logOneOfEachUsingLogMethod3(logger, logLevel) {
  const log = logger.log;
  // Ensure previously bound, by calling without `logger.`
  log(LogLevel.ERROR, `*** Log ERROR message ${counter} (at level ${logLevel})`, '***');
  log(LogLevel.WARN, `*** Log WARN message ${counter} (at level ${logLevel})`, '***');
  log(LogLevel.INFO, `*** Log INFO message ${counter} (at level ${logLevel})`, '***');
  log(LogLevel.DEBUG, `*** Log DEBUG message ${counter} (at level ${logLevel})`, '***');
  log(LogLevel.TRACE, `*** Log TRACE message ${counter} (at level ${logLevel})`, '***');
  log('<<< %s %s >>>', `*** Log "<<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');

  log(`${LogLevel.ERROR} <<< %s %s >>>`, `*** Log "ERROR <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  log(`${LogLevel.WARN} <<< %s %s >>>`, `*** Log "WARN <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  log(`${LogLevel.INFO} <<< %s %s >>>`, `*** Log "INFO <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  log(`${LogLevel.DEBUG} <<< %s %s >>>`, `*** Log "DEBUG <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  log(`${LogLevel.TRACE} <<< %s %s >>>`, `*** Log "TRACE <<< %s %s >>>" message ${counter} (at level ${logLevel})`, '***');
  ++counter;
}

function checkEnabledsBasedOnLogLevel(t, context, logLevel) {
  switch (logLevel) {
    case LogLevel.ERROR:
      t.notOk(context.warnEnabled, 'warn must not be enabled'); // fallthrough
    case LogLevel.WARN:
      t.notOk(context.infoEnabled, 'info must not be enabled'); // fallthrough
    case LogLevel.INFO:
      t.notOk(context.debugEnabled, 'debug must not be enabled'); // fallthrough
    case LogLevel.DEBUG:
      t.notOk(context.traceEnabled, 'trace must not be enabled');
      break;
  }
  switch (logLevel) {
    case LogLevel.TRACE:
      t.ok(context.traceEnabled, 'trace must be enabled'); // fallthrough
    case LogLevel.DEBUG:
      t.ok(context.debugEnabled, 'debug must be enabled'); // fallthrough
    case LogLevel.INFO:
      t.ok(context.infoEnabled, 'info must be enabled'); // fallthrough
    case LogLevel.WARN:
      t.ok(context.warnEnabled, 'warn must be enabled');
      break;
  }
}

// =====================================================================================================================
// Test isLoggingConfigured
// =====================================================================================================================

test('isLoggingConfigured', t => {
  t.equal(isLoggingConfigured({}), false, 'logging must not be configured on {}');

  const settings = {
    logLevel: LogLevel.ERROR,
    useLevelPrefixes: true,
    useConsoleTrace: false,
    underlyingLogger: undefined
  };
  const log = configureLogging({}, settings, undefined, true);

  t.equal(isLoggingConfigured(log), true, 'logging must be configured');
  t.end();
});

// =====================================================================================================================
// Test configureLogging on existing object with test logger to validate methods
// =====================================================================================================================

test('configureLogging on existing object with TRACE level with test logger & prefixes', t => {
  const logLevel = LogLevel.TRACE;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useConsole, '', t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLogging(context, settings, undefined, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, LogLevel.TRACE);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLogging on existing object with DEBUG level with test logger & prefixes', t => {
  const logLevel = LogLevel.DEBUG;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLogging(context, settings, undefined, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, LogLevel.DEBUG);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLogging on existing object with INFO level with test logger & prefixes', t => {
  const logLevel = LogLevel.INFO;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLogging(context, settings, undefined, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, LogLevel.INFO);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLogging on existing object with WARN level with test logger & prefixes', t => {
  const logLevel = LogLevel.WARN;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLogging(context, settings, undefined, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, LogLevel.WARN);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLogging on existing object with ERROR level with test logger & prefixes', t => {
  const logLevel = LogLevel.ERROR;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLogging(context, settings, undefined, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, LogLevel.ERROR);

  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging on new object with test logger to validate methods
// =====================================================================================================================

test('configureLogging on new object with TRACE level with test logger & prefixes', t => {
  const logLevel = LogLevel.TRACE;
  const useLevelPrefixes = false;
  const useConsole = false;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.TRACE);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with DEBUG level with test logger & prefixes', t => {
  const logLevel = LogLevel.DEBUG;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.DEBUG);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with INFO level with test logger & prefixes', t => {
  const logLevel = LogLevel.INFO;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.INFO);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with WARN level with test logger & prefixes', t => {
  const logLevel = LogLevel.WARN;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.WARN);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with ERROR level with test logger & prefixes', t => {
  const logLevel = LogLevel.ERROR;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.ERROR);

  logOneOfEach(log, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging on new object with console (i.e. test real usage for Lambdas) and useLevelPrefixes true
// =====================================================================================================================
const useConsoleTrace = false;

test('configureLogging on new object with TRACE level with console & prefixes', t => {
  const logLevel = LogLevel.TRACE;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.TRACE);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with DEBUG level with console & prefixes', t => {
  const logLevel = LogLevel.DEBUG;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.DEBUG);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with INFO level with console & prefixes', t => {
  const logLevel = LogLevel.INFO;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.INFO);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with WARN level with console & prefixes', t => {
  const logLevel = LogLevel.WARN;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.WARN);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with ERROR level with console & prefixes', t => {
  const logLevel = LogLevel.ERROR;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.ERROR);

  logOneOfEach(log, logLevel);

  t.end();
});


// =====================================================================================================================
// Test configureLogging on new object with console (i.e. test real usage for Lambdas) and useLevelPrefixes false
// =====================================================================================================================

test('configureLogging on new object with TRACE level with console & no prefixes', t => {
  const logLevel = LogLevel.TRACE;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.TRACE);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with DEBUG level with console & no prefixes', t => {
  const logLevel = LogLevel.DEBUG;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.DEBUG);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with INFO level with console & no prefixes', t => {
  const logLevel = LogLevel.INFO;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.INFO);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with WARN level with console & no prefixes', t => {
  const logLevel = LogLevel.WARN;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.WARN);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging on new object with ERROR level with console & no prefixes', t => {
  const logLevel = LogLevel.ERROR;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, '', t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLogging({}, settings, undefined, true);

  checkEnabledsBasedOnLogLevel(t, log, LogLevel.ERROR);

  logOneOfEach(log, logLevel);

  t.end();
});

// =====================================================================================================================
// Ensure that configureLogging on existing object does NOT override previously configured logging if not forced
// =====================================================================================================================

test('configureLogging on existing object MUST NOT override previously configured logging if not forced', t => {
  const useLevelPrefixes = true;
  const useConsole = false;

  const settings = {
    logLevel: LogLevel.TRACE,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: testLogger(LogLevel.TRACE, useConsole, '', t)
  };
  const context = configureLogging({}, settings, undefined, true);
  context.abc = 123;

  t.equal(context.logLevel, LogLevel.TRACE, 'logLevel must be LogLevel.TRACE');
  checkEnabledsBasedOnLogLevel(t, context, LogLevel.TRACE);

  // Now attempt to override
  const overrideSettings = {
    logLevel: LogLevel.ERROR,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: testLogger(LogLevel.ERROR, useConsole, '', t)
  };
  configureLogging(context, overrideSettings, undefined, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.equal(context.logLevel, LogLevel.TRACE, 'logLevel must still be LogLevel.TRACE');
  checkEnabledsBasedOnLogLevel(t, context, LogLevel.TRACE);

  logOneOfEach(context, context.logLevel);

  t.end();
});

// =====================================================================================================================
// Ensure that configureLogging on existing object does override previously configured logging if forced
// =====================================================================================================================

test('configureLogging on existing object MUST override previously configured logging if forced', t => {
  const useLevelPrefixes = true;
  const useConsole = false;

  // First pre-configure the context with TRACE level logging
  const settings = {
    logLevel: LogLevel.TRACE,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: testLogger(LogLevel.TRACE, useConsole, '', t)
  };
  const context = configureLogging({}, settings, undefined, true);
  context.abc = 123;

  t.equal(context.logLevel, LogLevel.TRACE, 'logLevel must be LogLevel.TRACE');
  checkEnabledsBasedOnLogLevel(t, context, LogLevel.TRACE);

  // Now attempt to override with ERROR level logging (by using forceConfiguration option)
  const overrideSettings = {
    logLevel: LogLevel.ERROR,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: testLogger(LogLevel.ERROR, useConsole, '', t)
  };
  configureLogging(context, overrideSettings, undefined, true);
  t.equal(context.abc, 123, 'context must still be intact');

  t.equal(context.logLevel, LogLevel.ERROR, 'logLevel must now be LogLevel.ERROR');
  checkEnabledsBasedOnLogLevel(t, context, LogLevel.ERROR);

  logOneOfEach(context, context.logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging without options on existing object with test logger to validate methods
// =====================================================================================================================

test('configureLogging without options on existing object with test logger & defaults', t => {
  const logLevel = defaultOptions.logLevel;
  const logger = testLogger(logLevel, false, '', t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  const onlyLogger = {underlyingLogger: logger};
  configureLogging(context, onlyLogger, undefined, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, '', t)
  };
  configureLogging(context, overrideSettings, undefined, true);

  // Now do NOT override with default logging configuration when NOT using force
  configureLogging(context, onlyLogger, undefined, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration using force
  configureLogging(context, onlyLogger, undefined, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with overridden options on existing object with test logger to validate methods
// =====================================================================================================================

test('configureLogging with overridden options on existing object with test logger & defaults', t => {
  const logLevel = defaultOptions.logLevel !== LogLevel.TRACE ? LogLevel.TRACE : LogLevel.ERROR;
  const options = {logLevel: logLevel};
  t.notEqual(options.logLevel, defaultOptions.logLevel, `options logLevel (${options.logLevel}) must differ from default (${defaultOptions.logLevel})`);

  const logger = testLogger(logLevel, false, '', t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  const onlyLogger = {underlyingLogger: logger};
  configureLogging(context, onlyLogger, options, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, '', t)
  };
  configureLogging(context, overrideSettings, undefined, true);

  // Now do NOT override with default logging configuration when NOT using force
  configureLogging(context, onlyLogger, options, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration using force
  configureLogging(context, onlyLogger, options, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging on existing object with test logger to validate methods
// =====================================================================================================================

test('configureLogging on existing object with test logger & config.logLevel etc.', t => {
  const logLevel = defaultOptions.logLevel !== LogLevel.TRACE ? LogLevel.TRACE : LogLevel.ERROR;
  const logger = testLogger(logLevel, false, '', t);

  // Configure logging from config when no logging configured yet (without force)
  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace,
    underlyingLogger: logger
  };
  configureLogging(context, settings, undefined, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: defaultOptions.useLevelPrefixes,
    useConsoleTrace: defaultOptions.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, '', t)
  };
  configureLogging(context, overrideSettings, undefined, true);

  // Now do NOT override with logging configuration again when NOT using force
  configureLogging(context, settings, undefined, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with logging configuration using force
  configureLogging(context, settings, undefined, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with default settings
// =====================================================================================================================

test('configureLogging with default settings on existing object with test logger & defaults', t => {
  const logLevel = defaultOptions.logLevel;
  const logger = testLogger(logLevel, false, '', t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  const onlyLogger = {underlyingLogger: logger};
  configureLogging(context, onlyLogger, undefined, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, '', t)
  };
  configureLogging(context, overrideSettings, undefined, true);

  // Now do NOT override with default logging configuration when NOT using force
  configureLogging(context, onlyLogger, undefined, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration using force
  configureLogging(context, onlyLogger, undefined, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with non-default settings
// =====================================================================================================================

test('configureLogging with settings on existing object with test logger & config.logLevel etc.', t => {
  const logLevel = defaultOptions.logLevel !== LogLevel.TRACE ? LogLevel.TRACE : LogLevel.ERROR;
  const logger = testLogger(logLevel, false, '', t);

  // Configure logging from config when no logging configured yet (without force)
  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace,
    underlyingLogger: logger
  };
  configureLogging(context, settings, undefined, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: defaultOptions.useLevelPrefixes,
    useConsoleTrace: defaultOptions.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, '', t)
  };

  configureLogging(context, overrideSettings, undefined, true);

  // Now do NOT override with logging configuration again when NOT using force
  configureLogging(context, settings, undefined, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with logging configuration using force
  configureLogging(context, settings, undefined, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with settings
// =====================================================================================================================

test('configureLogging with settings', t => {
  const logLevel = defaultOptions.logLevel;
  const logger = testLogger(logLevel, false, '', t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  //const settings = {underlyingLogger: logger};
  const settings = getDefaultLoggingOptions();
  settings.underlyingLogger = logger;

  const options = undefined;
  configureLogging(context, settings, options, false);

  t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideLogger = testLogger(overrideLogLevel, false, '', t);
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace,
    underlyingLogger: overrideLogger
  };
  configureLogging(context, overrideSettings, undefined, true);

  t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must be override test logger');

  // Now do NOT override with default logging configuration
  configureLogging(context, settings, options, false);

  t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must still be override test logger');

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration
  configureLogging(context, settings, options, true);

  t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must now be original test logger');

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with options
// =====================================================================================================================

test('configureLogging with default options on existing object with test logger & config.logLevel etc.', t => {
  const logLevel = defaultOptions.logLevel !== LogLevel.TRACE ? LogLevel.TRACE : LogLevel.ERROR;
  const logger = testLogger(logLevel, false, '', t);

  // Configure logging from config when no logging configured yet (without force)
  const context = {abc: 123};
  const onlyLogger = {underlyingLogger: logger};
  const options = {
    logLevel: logLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace
  };
  configureLogging(context, onlyLogger, options, false);

  t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideOptions = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: defaultOptions.useLevelPrefixes,
    useConsoleTrace: defaultOptions.useConsoleTrace
  };
  const overrideLogger = testLogger(overrideLogLevel, false, '', t);
  const onlyOverrideLogger = {underlyingLogger: overrideLogger};

  configureLogging(context, onlyOverrideLogger, overrideOptions, true);

  t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must now be override test logger');

  // Now do NOT override with logging configuration again
  configureLogging(context, onlyLogger, options, false);

  t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must still be override test logger');

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with logging configuration using force
  configureLogging(context, onlyLogger, options, true);

  t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must now be original test logger');

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with settings AND options
// =====================================================================================================================

test('configureLogging with settings AND options', t => {
  const logLevel = LogLevel.TRACE;
  const logger = testLogger(logLevel, false, '', t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};

  const settings = {logLevel: LogLevel.TRACE, underlyingLogger: logger};
  const options = getDefaultLoggingOptions();

  configureLogging(context, settings, options, false);

  t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
  const overrideLogger = testLogger(overrideLogLevel, false, '', t);
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultOptions.useLevelPrefixes,
    useConsoleTrace: !defaultOptions.useConsoleTrace,
    underlyingLogger: overrideLogger
  };
  configureLogging(context, overrideSettings, undefined, true);

  t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must now be override test logger');

  // Now do NOT override with default logging configuration
  configureLogging(context, settings, options, false);

  t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must still be override test logger');

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration
  configureLogging(context, settings, options, true);

  t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must now be original test logger');

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with settings AND options AND default envLogLevelName AND process.env.LOG_LEVEL
// =====================================================================================================================

test('configureLogging with settings AND options  AND default envLogLevelName AND process.env.LOG_LEVEL', t => {
  try {
    // Configure logLevel as an environment variable
    process.env.LOG_LEVEL = LogLevel.TRACE;

    const expectedLogLevel = LogLevel.TRACE;
    const logger = testLogger(expectedLogLevel, false, '', t);

    // Configure default logging when no logging configured yet (without force)
    const context = {abc: 123};

    const settings = {logLevel: LogLevel.INFO, underlyingLogger: logger};
    const options = getDefaultLoggingOptions();

    configureLogging(context, settings, options, false);

    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

    t.equal(context.abc, 123, 'context must still be intact');
    checkEnabledsBasedOnLogLevel(t, context, expectedLogLevel);
    logOneOfEach(context, expectedLogLevel);

    // Now attempt to override override with something else entirely using force (to change away from previous config settings)
    const overrideLogLevel = LogLevel.DEBUG;
    const overrideLogger = testLogger(expectedLogLevel, false, '', t);
    const overrideSettings = {
      logLevel: overrideLogLevel,
      useLevelPrefixes: !defaultOptions.useLevelPrefixes,
      useConsoleTrace: !defaultOptions.useConsoleTrace,
      underlyingLogger: overrideLogger
    };
    configureLogging(context, overrideSettings, undefined, true);

    t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must now be override test logger');

    t.equal(context.logLevel, expectedLogLevel, `logLevel must STILL be ${expectedLogLevel}`);

    // Now do NOT override with default logging configuration
    configureLogging(context, settings, options, false);

    t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must still be override test logger');

    // Makes NO difference, because environment setting takes precedence over any other setting or option regardless of forceConfiguration
    checkEnabledsBasedOnLogLevel(t, context, expectedLogLevel);
    logOneOfEach(context, expectedLogLevel);

    t.equal(context.logLevel, expectedLogLevel, `logLevel must STILL be ${expectedLogLevel}`);

    // Now attempt to override with default logging configuration
    configureLogging(context, settings, options, true);

    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must now be original test logger');

    t.equal(context.abc, 123, 'context must still be intact');
    checkEnabledsBasedOnLogLevel(t, context, expectedLogLevel);
    logOneOfEach(context, expectedLogLevel);

    t.equal(context.logLevel, expectedLogLevel, `logLevel must STILL be ${expectedLogLevel}`);

    t.end();
  } finally {
    process.env.LOG_LEVEL = undefined;
  }
});

// =====================================================================================================================
// Test configureLogging with settings AND options AND envLogLevelName set to "logLevel" AND process.env.logLevel
// =====================================================================================================================

test('configureLogging with settings AND options AND envLogLevelName set to "logLevel" AND process.env.logLevel', t => {
  try {
    // Configure logLevel as an environment variable
    process.env.logLevel = LogLevel.WARN;

    const expectedLogLevel = LogLevel.WARN;
    const logger = testLogger(expectedLogLevel, false, '', t);

    // Configure default logging when no logging configured yet (without force)
    const context = {abc: 123};

    const settings = {logLevel: LogLevel.TRACE, envLogLevelName: 'logLevel', underlyingLogger: logger};
    const options = getDefaultLoggingOptions();

    configureLogging(context, settings, options, false);

    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

    t.equal(context.abc, 123, 'context must still be intact');
    checkEnabledsBasedOnLogLevel(t, context, expectedLogLevel);
    logOneOfEach(context, expectedLogLevel);

    // Now attempt to override override with something else entirely using force (to change away from previous config settings)
    const overrideLogLevel = expectedLogLevel !== LogLevel.ERROR ? LogLevel.ERROR : LogLevel.TRACE;
    const overrideLogger = testLogger(expectedLogLevel, false, '', t);
    const overrideSettings = {
      logLevel: overrideLogLevel,
      useLevelPrefixes: !defaultOptions.useLevelPrefixes,
      envLogLevelName: 'logLevel',
      useConsoleTrace: !defaultOptions.useConsoleTrace,
      underlyingLogger: overrideLogger
    };
    configureLogging(context, overrideSettings, undefined, true);

    t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must be override test logger');

    t.equal(context.logLevel, expectedLogLevel, `logLevel must STILL be ${expectedLogLevel}`);

    // Now do NOT override with default logging configuration
    configureLogging(context, settings, options, false);

    t.equal(context._underlyingLogger, overrideLogger, 'context._underlyingLogger must still be override test logger');

    // Makes NO difference, because environment setting takes precedence over any other setting or option regardless of forceConfiguration
    checkEnabledsBasedOnLogLevel(t, context, expectedLogLevel);
    logOneOfEach(context, expectedLogLevel);

    t.equal(context.logLevel, expectedLogLevel, `logLevel must STILL be ${expectedLogLevel}`);

    // Now attempt to override with default logging configuration
    configureLogging(context, settings, options, true);

    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must now be original test logger');

    t.equal(context.abc, 123, 'context must still be intact');
    checkEnabledsBasedOnLogLevel(t, context, expectedLogLevel);
    logOneOfEach(context, expectedLogLevel);

    t.equal(context.logLevel, expectedLogLevel, `logLevel must STILL be ${expectedLogLevel}`);

    t.end();
  } finally {
    process.env.logLevel = undefined;
  }
});

// =====================================================================================================================
// log method and log function
// =====================================================================================================================

test('log method and log function', t => {
  const context = {abc: 123};
  const logLevelNames = Object.getOwnPropertyNames(LogLevel);
  for (let i = 0; i < logLevelNames.length; ++i) {
    const logLevel = LogLevel[logLevelNames[i]];
    const logger = testLogger(logLevel, false, 'TEST', t);

    // Configure default logging when no logging configured yet (without force)
    const settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);

    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

    checkEnabledsBasedOnLogLevel(t, context, logLevel);

    // Use log method to log a message at each level
    logOneOfEachUsingLogMethod(context, logLevel);

    // Use log function on context to log a message at each level
    logOneOfEachUsingLogFunction(context, logLevel, 'context');

    // Use log function on console to log a message at each level
    logOneOfEachUsingLogFunction(console, logLevel, 'console');

    // Use log function on undefined to log a message at each level
    logOneOfEachUsingLogFunction(undefined, logLevel, 'undefined');
  }

  // Check log method & log function with no log levels
  context.log('PINK', '*** Log "PINK" message ***');
  context.log('%s PINK', '*** Log "%s PINK" message ***');
  context.log('Blue', '*** Log "Blue" message ***');
  context.log('%s Blue', '*** Log "%s Blue" message ***');
  context.log('*** Log message without level ***');
  context.log();

  log(context, 'RED', '*** log(context, "RED") message ***');
  log(context, '%s RED', '*** log(context, "%s RED") message ***');
  log(context, 'Green', '*** log(context, "Green") message ***');
  log(context, '%s Green', '*** log(context, "%s Green") message ***');
  log(context, '*** log(context, ...) message without level ***');
  log(context);

  log(console, 'RED', '*** log(console, "RED") message ***');
  log(console, '%s RED', '*** log(console, "%s RED") message ***');
  log(undefined, 'Green', '*** log(undefined, "Green") message ***');
  log(undefined, '%s Green', '*** log(undefined, "%s Green") message ***');
  log(console, '*** log(console, ...) message without level ***');
  log(undefined);

  t.end();
});

test('log method and log function with first argument containing MORE than just a log level', t => {
  const context = {abc: 123};
  const logLevelNames = Object.getOwnPropertyNames(LogLevel);
  for (let i = 0; i < logLevelNames.length; ++i) {
    const logLevel = LogLevel[logLevelNames[i]];
    const logger = testLogger(logLevel, false, 'TEST', t);

    // Configure default logging when no logging configured yet (without force)
    const settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);

    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

    checkEnabledsBasedOnLogLevel(t, context, logLevel);

    // Use log method to log a message at each level
    logOneOfEachUsingLogMethod2(context, logLevel);

    // Use log function on context to log a message at each level
    logOneOfEachUsingLogFunction2(context, logLevel, 'context');

    // // Use log function on console to log a message at each level
    // logOneOfEachUsingLogFunction2(console, logLevel, 'console');

    // // Use log function on undefined to log a message at each level
    // logOneOfEachUsingLogFunction2(undefined, logLevel, 'undefined');
  }
  log();

  t.end();
});

// =====================================================================================================================
// Minimum viable loggers
// =====================================================================================================================

test('Minimum viable loggers', t => {
  const logLevelNames = Object.getOwnPropertyNames(LogLevel);
  for (let i = 0; i < logLevelNames.length; ++i) {
    const logLevel = LogLevel[logLevelNames[i]];
    // Logger with ALL methods
    let prefix = 'AllOK ';
    let logger = testLogger(LogLevel.TRACE, false, prefix, t);
    t.ok(isMinimumViableLogger(logger), 'test logger is a minimum viable logger');

    let context = {};
    let settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Logger without log method - is NOT viable!
    prefix = 'NoLog ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.log;
    t.notOk(isMinimumViableLogger(logger), 'test logger without a log method is NOT a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    t.throws(() => configureLogging(context, settings, undefined, true), Error, 'configureLogging must fail without log method');

    // Logger without error method - is NOT viable!
    prefix = 'NoError ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.error;
    t.notOk(isMinimumViableLogger(logger), 'test logger without error is NOT a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    t.throws(() => configureLogging(context, settings, undefined, true), Error, 'configureLogging must fail without error method');

    // Logger without warn method
    prefix = 'NoWarn ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.warn;
    t.ok(isMinimumViableLogger(logger), 'test logger without warn is still a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Logger without info method
    prefix = 'NoInfo ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.info;
    t.ok(isMinimumViableLogger(logger), 'test logger without info is still a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Logger without debug method
    prefix = 'NoDebug ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.debug;
    t.ok(isMinimumViableLogger(logger), 'test logger without debug is still a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Logger without trace method
    prefix = 'NoTrace ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.trace;
    t.ok(isMinimumViableLogger(logger), 'test logger without trace is still a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Logger without debug and trace methods
    prefix = 'NoDebugTrace ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.debug;
    delete logger.trace;
    t.ok(isMinimumViableLogger(logger), 'test logger without debug & trace is still a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Logger without info, debug and trace methods
    prefix = 'NoInfoDebugTrace ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.info;
    delete logger.debug;
    delete logger.trace;
    t.ok(isMinimumViableLogger(logger), 'test logger without info, debug & trace is still a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Logger without warn, debug and trace methods
    prefix = 'NoWarnInfoDebugTrace ';
    logger = testLogger(LogLevel.TRACE, false, prefix, t);
    delete logger.warn;
    delete logger.info;
    delete logger.debug;
    delete logger.trace;
    t.ok(isMinimumViableLogger(logger), 'test logger without warn, info, debug & trace is still a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');
    logOneOfEachUsingLogMethod(context, logLevel);

    // Console
    t.ok(isMinimumViableLogger(console), 'console is a minimum viable logger');

    context = {};
    settings = {logLevel: logLevel, underlyingLogger: console};
    configureLogging(context, settings, undefined, true);
    t.equal(context._underlyingLogger, console, 'context._underlyingLogger must be console');
    logOneOfEachUsingLogMethod(context, logLevel);
  }
  log();
  t.end();
});

// =====================================================================================================================
// error, warn, info, debug, trace & log methods and log functions must be bound
// =====================================================================================================================

test('error, warn, info, debug, trace & log methods and log functions must be bound', t => {

  const context = {abc: 123};
  const logLevelNames = Object.getOwnPropertyNames(LogLevel);
  for (let i = 0; i < logLevelNames.length; ++i) {
    const logLevel = LogLevel[logLevelNames[i]];
    const logger = testLogger(logLevel, false, 'TEST_BOUND_', t);

    // Configure default logging when no logging configured yet (without force)
    const settings = {logLevel: logLevel, underlyingLogger: logger};
    configureLogging(context, settings, undefined, true);

    t.equal(context._underlyingLogger, logger, 'context._underlyingLogger must be test logger');

    checkEnabledsBasedOnLogLevel(t, context, logLevel);

    // Use log method to log a message at each level
    logOneOfEach3(context, logLevel);
  }
  log();
  t.end();
});