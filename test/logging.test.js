'use strict';

/**
 * Unit tests for logging.js
 * @author Byron du Preez
 */

const test = require('tape');

// Load logging utils
const logging = require('../logging.js');
// Logging utils Constants
const ERROR = logging.ERROR;
const WARN = logging.WARN;
const INFO = logging.INFO;
const DEBUG = logging.DEBUG;
const TRACE = logging.TRACE;
// Logging utils functions
const isLoggingConfigured = logging.isLoggingConfigured;
const configureLoggingWithSettings = logging.configureLoggingWithSettings;
const configureDefaultLogging = logging.configureDefaultLogging;
const getDefaultLoggingSettings = logging.getDefaultLoggingSettings;
const configureLogging = logging.configureLogging;

const booleans = require('core-functions/booleans');
//const isBoolean = booleans.isBoolean;

const defaultSettings = logging.getDefaultLoggingSettings();

function testLogger(logLevel, useConsole, t) {
  function error() {
    //console.log(`IN error() with level (${logLevel.toUpperCase()})`);
    console.error.apply(console, arguments);
  }

  function warn() {
    //console.log(`IN warn() with level (${logLevel.toUpperCase()})`);
    console.warn.apply(console, arguments);
    if (logLevel === ERROR) t.fail('warn not enabled');
  }

  function info() {
    //console.log(`IN info() with level (${logLevel.toUpperCase()})`);
    console.log.apply(console, arguments);
    if (logLevel === ERROR || logLevel === WARN) t.fail('info not enabled');
  }

  function debug() {
    //console.log(`IN debug() with level (${logLevel.toUpperCase()})`);
    console.log.apply(console, arguments);
    if (logLevel !== DEBUG && logLevel !== TRACE) t.fail('debug not enabled');
  }

  function trace() {
    //console.log(`IN trace() with level (${logLevel.toUpperCase()})`);
    console.log.apply(console, arguments);
    if (logLevel !== TRACE) t.fail('trace not enabled');
  }

  return useConsole ? console : {
    error: error,
    warn: warn,
    info: info,
    debug: debug,
    trace: trace
  };
}

let counter = 1;

function logOneOfEach(log, logLevel) {
  log.error(`*** Error message ${counter} (at level ${logLevel.toUpperCase()})`, '***'); //, new Error('Boom').stack);
  log.warn(`*** Warn message ${counter} (at level ${logLevel.toUpperCase()})`, '***');
  log.info(`*** Info message ${counter} (at level ${logLevel.toUpperCase()})`, '***');
  log.debug(`*** Debug message ${counter} (at level ${logLevel.toUpperCase()})`, '***');
  log.trace(`*** Trace message ${counter} (at level ${logLevel.toUpperCase()})`, '***');
  ++counter;
}

function checkEnabledsBasedOnLogLevel(t, context, logLevel) {
  switch (logLevel) {
    case ERROR:
      t.notOk(context.warnEnabled, 'warn must not be enabled'); // fallthrough
    case WARN:
      t.notOk(context.infoEnabled, 'info must not be enabled'); // fallthrough
    case INFO:
      t.notOk(context.debugEnabled, 'debug must not be enabled'); // fallthrough
    case DEBUG:
      t.notOk(context.traceEnabled, 'trace must not be enabled');
      break;
  }
  switch (logLevel) {
    case TRACE:
      t.ok(context.traceEnabled, 'trace must be enabled'); // fallthrough
    case DEBUG:
      t.ok(context.debugEnabled, 'debug must be enabled'); // fallthrough
    case INFO:
      t.ok(context.infoEnabled, 'info must be enabled'); // fallthrough
    case WARN:
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
    logLevel: ERROR,
    useLevelPrefixes: true,
    useConsoleTrace: false,
    underlyingLogger: undefined
  };
  const log = configureLoggingWithSettings({}, settings, true);

  t.equal(isLoggingConfigured(log), true, 'logging must be configured');
  t.end();
});

// =====================================================================================================================
// Test configureLoggingWithSettings on existing object with test logger to validate methods
// =====================================================================================================================

test('configureLoggingWithSettings on existing object with TRACE level with test logger & prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useConsole, t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLoggingWithSettings(context, settings, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, TRACE);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingWithSettings on existing object with DEBUG level with test logger & prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLoggingWithSettings(context, settings, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, DEBUG);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingWithSettings on existing object with INFO level with test logger & prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLoggingWithSettings(context, settings, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, INFO);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingWithSettings on existing object with WARN level with test logger & prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLoggingWithSettings(context, settings, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, WARN);

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingWithSettings on existing object with ERROR level with test logger & prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  configureLoggingWithSettings(context, settings, false);
  t.equal(context.abc, 123, 'context must still be intact');

  checkEnabledsBasedOnLogLevel(t, context, ERROR);

  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLoggingWithSettings on new object with test logger to validate methods
// =====================================================================================================================

test('configureLoggingWithSettings on new object with TRACE level with test logger & prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = false;
  const useConsole = false;

  const logger = testLogger(logLevel, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, TRACE);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with DEBUG level with test logger & prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, DEBUG);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with INFO level with test logger & prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, INFO);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with WARN level with test logger & prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, WARN);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with ERROR level with test logger & prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, ERROR);

  logOneOfEach(log, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLoggingWithSettings on new object with console (i.e. test real usage for Lambdas) and useLevelPrefixes true
// =====================================================================================================================
const useConsoleTrace = false;

test('configureLoggingWithSettings on new object with TRACE level with console & prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, TRACE);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with DEBUG level with console & prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, DEBUG);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with INFO level with console & prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, INFO);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with WARN level with console & prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, WARN);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with ERROR level with console & prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, ERROR);

  logOneOfEach(log, logLevel);

  t.end();
});


// =====================================================================================================================
// Test configureLoggingWithSettings on new object with console (i.e. test real usage for Lambdas) and useLevelPrefixes false
// =====================================================================================================================

test('configureLoggingWithSettings on new object with TRACE level with console & no prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, TRACE);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with DEBUG level with console & no prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, DEBUG);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with INFO level with console & no prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, INFO);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with WARN level with console & no prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, WARN);

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLoggingWithSettings on new object with ERROR level with console & no prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: logger
  };
  const log = configureLoggingWithSettings({}, settings, true);

  checkEnabledsBasedOnLogLevel(t, log, ERROR);

  logOneOfEach(log, logLevel);

  t.end();
});

// =====================================================================================================================
// Ensure that configureLoggingWithSettings on existing object does NOT override previously configured logging if not forced
// =====================================================================================================================

test('configureLoggingWithSettings on existing object MUST NOT override previously configured logging if not forced', t => {
  const useLevelPrefixes = true;
  const useConsole = false;

  const settings = {
    logLevel: TRACE,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: testLogger(TRACE, useConsole, t)
  };
  const context = configureLoggingWithSettings({}, settings, true);
  context.abc = 123;

  t.equal(context.logLevel, TRACE, 'logLevel must be TRACE');
  checkEnabledsBasedOnLogLevel(t, context, TRACE);

  // Now attempt to override
  const overrideSettings = {
    logLevel: ERROR,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: testLogger(ERROR, useConsole, t)
  };
  configureLoggingWithSettings(context, overrideSettings, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.equal(context.logLevel, TRACE, 'logLevel must still be TRACE');
  checkEnabledsBasedOnLogLevel(t, context, TRACE);

  logOneOfEach(context, context.logLevel);

  t.end();
});

// =====================================================================================================================
// Ensure that configureLoggingWithSettings on existing object does override previously configured logging if forced
// =====================================================================================================================

test('configureLoggingWithSettings on existing object MUST override previously configured logging if forced', t => {
  const useLevelPrefixes = true;
  const useConsole = false;

  // First pre-configure the context with TRACE level logging
  const settings = {
    logLevel: TRACE,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsoleTrace,
    underlyingLogger: testLogger(TRACE, useConsole, t)
  };
  const context = configureLoggingWithSettings({}, settings, true);
  context.abc = 123;

  t.equal(context.logLevel, TRACE, 'logLevel must be TRACE');
  checkEnabledsBasedOnLogLevel(t, context, TRACE);

  // Now attempt to override with ERROR level logging (by using forceConfiguration option)
  const overrideSettings = {
    logLevel: ERROR,
    useLevelPrefixes: useLevelPrefixes,
    useConsoleTrace: useConsole,
    underlyingLogger: testLogger(ERROR, useConsole, t)
  };
  configureLoggingWithSettings(context, overrideSettings, true);
  t.equal(context.abc, 123, 'context must still be intact');

  t.equal(context.logLevel, ERROR, 'logLevel must now be ERROR');
  checkEnabledsBasedOnLogLevel(t, context, ERROR);

  logOneOfEach(context, context.logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureDefaultLogging without options on existing object with test logger to validate methods
// =====================================================================================================================

test('configureDefaultLogging without options on existing object with test logger & defaults', t => {
  const options = undefined;
  const logLevel = defaultSettings.logLevel;
  const logger = testLogger(logLevel, false, t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  configureDefaultLogging(context, options, logger, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, t)
  };
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with default logging configuration when NOT using force
  configureDefaultLogging(context, options, logger, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration using force
  configureDefaultLogging(context, options, logger, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureDefaultLogging with overridden options on existing object with test logger to validate methods
// =====================================================================================================================

test('configureDefaultLogging with overridden options on existing object with test logger & defaults', t => {
  const logLevel = defaultSettings.logLevel !== TRACE ? TRACE : ERROR;
  const options = {logLevel: logLevel};
  t.notEqual(options.logLevel, defaultSettings.logLevel, `options logLevel (${options.logLevel}) must differ from default (${defaultSettings.logLevel})`);

  const logger = testLogger(logLevel, false, t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  configureDefaultLogging(context, options, logger, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, t)
  };
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with default logging configuration when NOT using force
  configureDefaultLogging(context, options, logger, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration using force
  configureDefaultLogging(context, options, logger, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLoggingWithSettings on existing object with test logger to validate methods
// =====================================================================================================================

test('configureLoggingWithSettings on existing object with test logger & config.logLevel etc.', t => {
  const logLevel = defaultSettings.logLevel !== TRACE ? TRACE : ERROR;
  const logger = testLogger(logLevel, false, t);

  // Configure logging from config when no logging configured yet (without force)
  const context = {abc: 123};
  const settings = {
    logLevel: logLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace,
    underlyingLogger: logger
  };
  configureLoggingWithSettings(context, settings, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: defaultSettings.useLevelPrefixes,
    useConsoleTrace: defaultSettings.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, t)
  };
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with logging configuration again when NOT using force
  configureLoggingWithSettings(context, settings, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with logging configuration using force
  configureLoggingWithSettings(context, settings, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLoggingWithSettings with default getDefaultLoggingSettings
// =====================================================================================================================

test('configureLoggingWithSettings with default getDefaultLoggingSettings on existing object with test logger & defaults', t => {
  const logLevel = defaultSettings.logLevel;
  const logger = testLogger(logLevel, false, t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  const defaults = getDefaultLoggingSettings(undefined, logger);
  configureLoggingWithSettings(context, defaults, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, t)
  };
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with default logging configuration when NOT using force
  configureLoggingWithSettings(context, defaults, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration using force
  configureLoggingWithSettings(context, defaults, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLoggingWithSettings with non-default getDefaultLoggingSettings
// =====================================================================================================================

test('configureLoggingWithSettings with getDefaultLoggingSettings on existing object with test logger & config.logLevel etc.', t => {
  const logLevel = defaultSettings.logLevel !== TRACE ? TRACE : ERROR;
  const logger = testLogger(logLevel, false, t);

  // Configure logging from config when no logging configured yet (without force)
  const context = {abc: 123};
  const options = {
    logLevel: logLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace
  };
  const settings = getDefaultLoggingSettings(options, logger);
  configureLoggingWithSettings(context, settings, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideOptions = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: defaultSettings.useLevelPrefixes,
    useConsoleTrace: defaultSettings.useConsoleTrace,
  };
  const overrideSettings = getDefaultLoggingSettings(overrideOptions, testLogger(overrideLogLevel, false, t));
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with logging configuration again when NOT using force
  configureLoggingWithSettings(context, settings, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with logging configuration using force
  configureLoggingWithSettings(context, settings, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with settings
// =====================================================================================================================

test('configureLogging with settings', t => {
  const logLevel = defaultSettings.logLevel;
  const logger = testLogger(logLevel, false, t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};
  const settings = getDefaultLoggingSettings(undefined, logger);
  const options = undefined;
  configureLogging(context, settings, options, logger, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, t)
  };
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with default logging configuration
  configureLogging(context, settings, options, logger, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration
  configureLogging(context, settings, options, logger, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with options
// =====================================================================================================================

test('configureLogging with getDefaultLoggingSettings on existing object with test logger & config.logLevel etc.', t => {
  const logLevel = defaultSettings.logLevel !== TRACE ? TRACE : ERROR;
  const logger = testLogger(logLevel, false, t);

  // Configure logging from config when no logging configured yet (without force)
  const context = {abc: 123};
  const settings = undefined;
  const options = {
    logLevel: logLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace
  };
  configureLogging(context, settings, options, logger, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideOptions = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: defaultSettings.useLevelPrefixes,
    useConsoleTrace: defaultSettings.useConsoleTrace,
  };
  const overrideSettings = getDefaultLoggingSettings(overrideOptions, testLogger(overrideLogLevel, false, t));
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with logging configuration again
  configureLogging(context, settings, options, logger, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with logging configuration using force
  configureLogging(context, settings, options, logger, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with settings AND options
// =====================================================================================================================

test('configureLogging with settings AND options', t => {
  const logLevel = TRACE;
  const logger = testLogger(logLevel, false, t);

  // Configure default logging when no logging configured yet (without force)
  const context = {abc: 123};

  const settings = {logLevel: TRACE, underlyingLogger: logger};
  const options = getDefaultLoggingSettings(undefined, undefined);

  configureLogging(context, settings, options, undefined, false);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  // Now override with something else entirely using force (to change away from previous config settings)
  const overrideLogLevel = logLevel !== ERROR ? ERROR : TRACE;
  const overrideSettings = {
    logLevel: overrideLogLevel,
    useLevelPrefixes: !defaultSettings.useLevelPrefixes,
    useConsoleTrace: !defaultSettings.useConsoleTrace,
    underlyingLogger: testLogger(overrideLogLevel, false, t)
  };
  configureLoggingWithSettings(context, overrideSettings, true);

  // Now do NOT override with default logging configuration
  configureLogging(context, settings, options, logger, false);

  checkEnabledsBasedOnLogLevel(t, context, overrideLogLevel);
  logOneOfEach(context, overrideLogLevel);

  // Now override with default logging configuration
  configureLogging(context, settings, options, logger, true);

  t.equal(context.abc, 123, 'context must still be intact');
  checkEnabledsBasedOnLogLevel(t, context, logLevel);
  logOneOfEach(context, logLevel);

  t.end();
});
