# logging-utils v1.0.6
Utilities for configuring simple log level based logging functionality on an object.

The log levels supported are the following:
- **ERROR** - only logs error messages
- **WARN** - only logs warning and error messages
- **INFO** - logs info, warning and error messages
- **DEBUG** - logs debug, info, warning and error messages
- **TRACE** - logs trace, debug, info, warning and error messages (i.e. all)

Main module:
- logging-utils.js

This module is exported as a [Node.js](https://nodejs.org/) module.

## Installation

Using npm:
```bash
$ npm i --save logging-utils
```

## Usage

### 1. Configure logging:

1. Require logging-utils
```js
// To use the logging utilties
const logging = require('logging-utils');

// Logging configuration functions
const configureLogging = logging.configureLogging;
const isLoggingConfigured = logging.isLoggingConfigured;
const configureDefaultLogging = logging.configureDefaultLogging;

// Log level constants
const ERROR = logging.ERROR;
const WARN = logging.WARN;
const INFO = logging.INFO;
const DEBUG = logging.DEBUG;
const TRACE = logging.TRACE;
```
2. Provide a context object on which to configure logging, e.g:
```js
const context = { a: 1, b: 2, c: 3 }; // replace with your own target object to be configured
```
3. Configure logging on the context object

* To configure default logging on an existing object:
```js
configureLogging(context);
```
* To configure WARN level logging on an existing object
```js
configureLogging(context, WARN);
```
* To configure specific logging (WITHOUT overriding any existing logging on context)
```js
configureLogging(context, DEBUG, false, console, false, false);
```
* To configure specific logging (OVERRIDING any existing logging on context!)
```js
configureLogging(context, DEBUG, false, console, false, true);
```
* To configure simple default logging on a new object
```js
const log = configureLogging({});
```

* To configure default logging on an existing object
```js
configureDefaultLogging(context);
```
* To configure default logging on an existing object with an explicit logger and forceConfiguration true
```js
configureDefaultLogging(context, console, true);

// Alternatives specifying optional underlying logger and/or forceConfiguration 
configureDefaultLogging(context, console);
configureDefaultLogging(context, undefined, true);
```

* To configure logging from a config object with settings under config.logging 
```js
const config = { logging: { logLevel: DEBUG, useLevelPrefixes: true, useConsoleTrace: false } }; // replace with your own config object

configureLoggingFromConfig(context, config);

// Alternatives specifying optional underlying logger and/or forceConfiguration 
configureLoggingFromConfig(context, config, console);
configureLoggingFromConfig(context, config, undefined, true);
```

* To configure logging from a config object with settings directly under config
```js
const config = { logLevel: DEBUG, useLevelPrefixes: true, useConsoleTrace: false }; // replace with your own config object

configureLoggingFromConfig(context, config);
```

### 2. Log messages

* To log errors:
```js
// Log an error with a strack trace
context.error('Error message 1', new Error('Boom').stack);

// Log an error without a stack trace
context.error('Error message 2');
```
* To log warnings:
```js
// Log a warning (or do nothing when warnings are disabled)
context.warn('Warning message 1');

// To avoid building the warning message (when warnings are disabled)
if (context.warnEnabled) context.warn('Warning message 2');
```
* To log info messages:
```js
// Log an info message (or do nothing when info messages are disabled)
context.info('Info message 1');

// To avoid building the info message (when info messages are disabled)
if (context.infoEnabled) context.info('Info message 2');
```
* To log debug messages:
```js
// Log a debug message (or do nothing when debug messages are disabled)
context.debug('Debug message 1');

// To avoid building the debug message (when debug messages are disabled)
if (context.debugEnabled) context.debug('Debug message 2');
```
* To log trace messages:
```js
// To log a trace message (or do nothing when trace messages are disabled)
context.trace('Trace message 1');

// To avoid building the trace message (when trace messages are disabled)
if (context.traceEnabled) context.trace('Trace message 2');
```

## Unit tests
This module's unit tests were developed with and must be run with [tape](https://www.npmjs.com/package/tape). The unit tests have been tested on [Node.js v4.3.2](https://nodejs.org/en/blog/release/v4.3.2/).  

See the [package source](https://github.com/byron-dupreez/logging-utils) for more details.

## Changes

### 1.0.6
- Updated `core-functions` dependency to version 2.0.3

### 1.0.5
- Updated `core-functions` dependency to version 2.0.2

### 1.0.4
- Added optional `underlyingLogger` and `forceConfiguration` arguments to the `configureDefaultLogging` function
- Added a new `configureLoggingFromConfig` function to simplify configuring from a config object/file 
- Added unit tests for `configureDefaultLogging` and `configureLoggingFromConfig` functions
- Updated `core-functions` dependency to version 2.0.1

### 1.0.3
- Removed dependency on and replaced usage of `core-functions/functions` functions with standard JS functionality
- Updated `core-functions` dependency to version 2.0.0

### 1.0.2
- Added an explicit `configureDefaultLogging` function for clarity.
- Minor JSDoc updates
- Updated core-functions dependency to 1.2.0

### 1.0.1
- Simply set core-functions dependency to 1.1.1



