'use strict';

/**
 * Unit tests for logging-utils.
 * @author Byron du Preez
 */

const test = require('tape');

// Load logging utils
const logging = require('../logging-utils.js');
// Logging utils Constants
const ERROR = logging.ERROR;
const WARN = logging.WARN;
const INFO = logging.INFO;
const DEBUG = logging.DEBUG;
const TRACE = logging.TRACE;
//const defaultLogLevel = logging.defaultLogLevel;
// Logging utils functions
const isLoggingConfigured = logging.isLoggingConfigured;
const configureLoggingOn = logging.configureLoggingOn;
const configureLogging = logging.configureLogging;

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

// =====================================================================================================================
// Test isLoggingConfigured
// =====================================================================================================================

test('isLoggingConfigured', t => {
  t.equal(isLoggingConfigured({}), false, 'logging must not be configured on {}');

  const log = configureLogging(ERROR);
  t.equal(isLoggingConfigured(log), true, 'logging must be configured');
  t.end();
});

// =====================================================================================================================
// Test configureLoggingOn with test logger to validate methods
// =====================================================================================================================

test('configureLoggingOn with TRACE level with test logger & prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useConsole, t);

  const context = { abc: 123 };
  configureLoggingOn(context, logLevel, useLevelPrefixes, logger, useConsole, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.ok(context.warnEnabled, 'warn must be enabled');
  t.ok(context.infoEnabled, 'info must be enabled');
  t.ok(context.debugEnabled, 'debug must be enabled');
  t.ok(context.traceEnabled, 'trace must be enabled');

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingOn with DEBUG level with test logger & prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = { abc: 123 };
  configureLoggingOn(context, logLevel, useLevelPrefixes, logger, useConsole, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.ok(context.warnEnabled, 'warn must be enabled');
  t.ok(context.infoEnabled, 'info must be enabled');
  t.ok(context.debugEnabled, 'debug must be enabled');
  t.notOk(context.traceEnabled, 'trace must not be enabled');

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingOn with INFO level with test logger & prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = { abc: 123 };
  configureLoggingOn(context, logLevel, useLevelPrefixes, logger, useConsole, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.ok(context.warnEnabled, 'warn must be enabled');
  t.ok(context.infoEnabled, 'info must be enabled');
  t.notOk(context.debugEnabled, 'debug must not be enabled');
  t.notOk(context.traceEnabled, 'trace must not be enabled');

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingOn with WARN level with test logger & prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = { abc: 123 };
  configureLoggingOn(context, logLevel, useLevelPrefixes, logger, useConsole, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.ok(context.warnEnabled, 'warn must be enabled');
  t.notOk(context.infoEnabled, 'info must not be enabled');
  t.notOk(context.debugEnabled, 'debug must not be enabled');
  t.notOk(context.traceEnabled, 'trace must not be enabled');

  logOneOfEach(context, logLevel);

  t.end();
});

test('configureLoggingOn with ERROR level with test logger & prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);

  const context = { abc: 123 };
  configureLoggingOn(context, logLevel, useLevelPrefixes, logger, useConsole, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.notOk(context.warnEnabled, 'warn must not be enabled');
  t.notOk(context.infoEnabled, 'info must not be enabled');
  t.notOk(context.debugEnabled, 'debug must not be enabled');
  t.notOk(context.traceEnabled, 'trace must not be enabled');

  logOneOfEach(context, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with test logger to validate methods
// =====================================================================================================================

test('configureLogging with TRACE level with test logger & prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = false;
  const useConsole = false;

  const logger = testLogger(logLevel, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsole);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.ok(log.debugEnabled, 'debug must be enabled');
  t.ok(log.traceEnabled, 'trace must be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with DEBUG level with test logger & prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsole);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.ok(log.debugEnabled, 'debug must be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with INFO level with test logger & prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsole);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with WARN level with test logger & prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsole);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.notOk(log.infoEnabled, 'info must not be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with ERROR level with test logger & prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = true;
  const useConsole = false;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsole);

  t.notOk(log.warnEnabled, 'warn must not be enabled');
  t.notOk(log.infoEnabled, 'info must not be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

// =====================================================================================================================
// Test configureLogging with console (i.e. test real usage for Lambdas) and useLevelPrefixes true
// =====================================================================================================================
const useConsoleTrace = false;

test('configureLogging with TRACE level with console & prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.ok(log.debugEnabled, 'debug must be enabled');
  t.ok(log.traceEnabled, 'trace must be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with DEBUG level with console & prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.ok(log.debugEnabled, 'debug must be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with INFO level with console & prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with WARN level with console & prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.notOk(log.infoEnabled, 'info must not be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with ERROR level with console & prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = true;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.notOk(log.warnEnabled, 'warn must not be enabled');
  t.notOk(log.infoEnabled, 'info must not be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});



// =====================================================================================================================
// Test configureLogging with console (i.e. test real usage for Lambdas) and useLevelPrefixes false
// =====================================================================================================================

test('configureLogging with TRACE level with console & no prefixes', t => {
  const logLevel = TRACE;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.ok(log.debugEnabled, 'debug must be enabled');
  t.ok(log.traceEnabled, 'trace must be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with DEBUG level with console & no prefixes', t => {
  const logLevel = DEBUG;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.ok(log.debugEnabled, 'debug must be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with INFO level with console & no prefixes', t => {
  const logLevel = INFO;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.ok(log.infoEnabled, 'info must be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with WARN level with console & no prefixes', t => {
  const logLevel = WARN;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.ok(log.warnEnabled, 'warn must be enabled');
  t.notOk(log.infoEnabled, 'info must not be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

test('configureLogging with ERROR level with console & no prefixes', t => {
  const logLevel = ERROR;
  const useLevelPrefixes = false;
  const useConsole = true;

  const logger = testLogger(logLevel, useLevelPrefixes, useConsole, t);
  const log = configureLogging(logLevel, useLevelPrefixes, logger, useConsoleTrace);

  t.notOk(log.warnEnabled, 'warn must not be enabled');
  t.notOk(log.infoEnabled, 'info must not be enabled');
  t.notOk(log.debugEnabled, 'debug must not be enabled');
  t.notOk(log.traceEnabled, 'trace must not be enabled');

  logOneOfEach(log, logLevel);

  t.end();
});

// =====================================================================================================================
// Ensure that configureLoggingOn does NOT override previously configured logging if not forced
// =====================================================================================================================

test('configureLoggingOn MUST NOT override previously configured logging if not forced', t => {
  const useLevelPrefixes = true;
  const useConsole = false;

  const context = configureLogging(TRACE, useLevelPrefixes, testLogger(TRACE, useConsole, t), useConsoleTrace);
  context.abc = 123;

  t.equal(context.logLevel, TRACE, 'logLevel must be TRACE');
  t.ok(context.warnEnabled, 'warn must be enabled');
  t.ok(context.infoEnabled, 'info must be enabled');
  t.ok(context.debugEnabled, 'debug must be enabled');
  t.ok(context.traceEnabled, 'trace must be enabled');

  // Now attempt to override
  configureLoggingOn(context, ERROR, useLevelPrefixes, testLogger(ERROR, useConsole, t), useConsole, false);
  t.equal(context.abc, 123, 'context must still be intact');

  t.equal(context.logLevel, TRACE, 'logLevel must still be TRACE');
  t.ok(context.warnEnabled, 'warn must still be enabled');
  t.ok(context.infoEnabled, 'info must still be enabled');
  t.ok(context.debugEnabled, 'debug must still be enabled');
  t.ok(context.traceEnabled, 'trace must still be enabled');

  logOneOfEach(context, context.logLevel);

  t.end();
});

// =====================================================================================================================
// Ensure that configureLoggingOn does override previously configured logging if forced
// =====================================================================================================================

test('configureLoggingOn MUST override previously configured logging if forced', t => {
  const useLevelPrefixes = true;
  const useConsole = false;

  const context = configureLogging(TRACE, useLevelPrefixes, testLogger(TRACE, useConsole, t), useConsoleTrace);
  context.abc = 123;

  t.equal(context.logLevel, TRACE, 'logLevel must be TRACE');
  t.ok(context.warnEnabled, 'warn must be enabled');
  t.ok(context.infoEnabled, 'info must be enabled');
  t.ok(context.debugEnabled, 'debug must be enabled');
  t.ok(context.traceEnabled, 'trace must be enabled');

  // Now attempt to override
  configureLoggingOn(context, ERROR, useLevelPrefixes, testLogger(ERROR, useConsole, t), useConsole, true);
  t.equal(context.abc, 123, 'context must still be intact');

  t.equal(context.logLevel, ERROR, 'logLevel must now be ERROR');
  t.notOk(context.warnEnabled, 'warn must now be disabled');
  t.notOk(context.infoEnabled, 'info must now be disabled');
  t.notOk(context.debugEnabled, 'debug must now be disabled');
  t.notOk(context.traceEnabled, 'trace must now be disabled');

  logOneOfEach(context, context.logLevel);

  t.end();
});

