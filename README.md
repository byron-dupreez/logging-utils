# logging-utils v4.0.5
Utilities for configuring simple log level based logging functionality on an object.

The log levels supported are the following:
- **ERROR** - only logs error messages
- **WARN** - only logs warning and error messages
- **INFO** - logs info, warning and error messages
- **DEBUG** - logs debug, info, warning and error messages
- **TRACE** - logs trace, debug, info, warning and error messages (i.e. all)

Main module:
- logging.js

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
// To use the logging utilities
const logging = require('logging-utils');

// Valid logging levels
const LogLevel = logging.LogLevel; 

// Logging configuration functions
const isLoggingConfigured = logging.isLoggingConfigured;
const configureLogging = logging.configureLogging;

// Convenience logging function
const log = logging.log;
```
2. Provide a context object on which to configure logging, e.g:
```js
const context = {}; // replace with your own target object to be configured
```
3. Configure logging on the context object

* To configure default logging on an existing object (WITHOUT overriding any existing logging on context)
```js
configureLogging(context);
// which is equivalent to:
configureLogging(context, {logLevel: LogLevel.INFO});
```
* To configure WARN level logging on an existing object (WITHOUT overriding any existing logging on context)
```js
configureLogging(context, {logLevel: LogLevel.WARN});
```
* To configure specific logging (WITHOUT overriding any existing logging on context)
```js
const settings = {logLevel: LogLevel.DEBUG, useLevelPrefixes: false, useConsoleTrace: false, underlyingLogger: console}; // or your own settings
configureLogging(context, settings);
// OR with explicit forceConfiguration false
configureLogging(context, settings, undefined, false);
```
* To configure specific logging (OVERRIDING any existing logging on context!)
```js
configureLogging(context, settings, undefined, true);
```

* To configure default logging on a new object
```js
const log = configureLogging({});
```
* To configure default logging on an existing object with overriding options and forceConfiguration true
```js
configureLogging(context, undefined, options, true);
// Alternatively ...
configureLogging(context, options, undefined, true);
```
* To configure default logging on an existing object with overriding options, an explicit logger and forceConfiguration true
```js
const options = undefined; // ... or any LoggingOptions you want to use to partially or fully override the default logging settings
configureLogging(context, {underlyingLogger: console}, options);
const CustomLogger = {/* ... */}; // implement your own custom logger if required
configureLogging(context, {underlyingLogger: CustomLogger}, options, true);
```

* To configure logging from options
```js
const options = { logLevel: LogLevel.DEBUG, useLevelPrefixes: true, useConsoleTrace: false }; // replace with your own options
configureLogging(context, undefined, options);
// OR just ...
configureLogging(context, options);
```

* To configure logging from EITHER logging settings OR logging options (OR defaults if neither) - WITHOUT overriding any existing logging on context
```js
configureLogging(context, settings, options);
// OR with explicit forceConfiguration false ...
configureLogging(context, settings, options, false);
```

* To configure logging from EITHER logging settings OR logging options (OR defaults if neither) - OVERRIDING any existing logging on context!
```js
configureLogging(context, settings, options, true);
```

* To **OVERRIDE** any pre-configured `logLevel` setting or option during runtime configuration, set a logging level on 
 the environment variable named by the `envLogLevelName` setting, which is also configurable and defaults to `'LOG_LEVEL'`. 
 Any valid `logLevel` found with `process.env[envLogLevelName]` will take precedence over any other `logLevel` setting or option.
```js
// For unit testing, set the `LOG_LEVEL` environment variable programmatically
process.env.LOG_LEVEL = LogLevel.DEBUG;

// Alternatively, if you configured your own `envLogLevelName` as 'MyLogLevel', e.g.
configureLogging(context, {envLogLevelName: 'MyLogLevel'});
// then for unit testing, set your `MyLogLevel` environment variable programmatically
process.env.MyLogLevel = LogLevel.TRACE;
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

* To log messages at a specified log level (using the `log` method):
```js
// To log a message at LogLevel.TRACE (or do nothing when trace messages are disabled)
context.log(LogLevel.ERROR, 'Error message 1', new Error('Boom').stack);

// Note that this will also work with console, but you won't get any suppression according to log level
console.log(LogLevel.TRACE, 'Trace message 1');
```

* To log messages at a specified log level (using the `log` function):
```js
// Alternatively using log function
log(context, LogLevel.DEBUG, 'Debug message 1');

// Note that this will also work with console (and undefined), but you won't get any suppression according to log level
log(console, LogLevel.WARN, 'Warn message 1');
log(undefined, LogLevel.ERROR, 'Error message 1', new Error('Boom 2').stack);
```

## Unit tests
This module's unit tests were developed with and must be run with [tape](https://www.npmjs.com/package/tape). The unit tests have been tested on [Node.js v4.3.2](https://nodejs.org/en/blog/release/v4.3.2/).  

See the [package source](https://github.com/byron-dupreez/logging-utils) for more details.

## Changes

### 4.0.5
- Updated `core-functions` dependency to version 3.0.6
- Fixed wrong version number in `test/package.json`

### 4.0.4
- Updated `core-functions` dependency to version 3.0.5

### 4.0.3
- Upgraded to Node 6.10.3
- Updated `core-functions` dependency to version 3.0.4

### 4.0.2
- Updated `core-functions` dependency to version 3.0.3
  
### 4.0.1
- Updated `core-functions` dependency to version 3.0.2
  
### 4.0.0
- Major changes to and simplification of `logging.js` API (NOT BACKWARD COMPATIBLE!):
  - Removed `underlyingLogger` parameter from `configureLogging` function, which was ignored when `settings` were 
    provided and was also redundant, since it can be set via the `settings` parameter
  - Removed redundant `configureLoggingWithSettings`, `configureDefaultLogging` and `getDefaultLoggingSettings` functions
  - Replaced `ERROR`, `WARN`, `INFO`, `DEBUG` and `TRACE` constants with properties in new `LogLevel` constant to 
    simplify import & usage and changed their values to uppercase for consistency
  - Removed `toValidLogLevelOrDefault` function
  - Renamed `Logging` typedef to `Logger`
  - Added additional `log` method to the target object during `configureLogging` to enable logging at a specified level
  - Added `log` function, which delegates to new `log` method to enable logging at a specified level
  - Exported `isValidLogLevel` and new `cleanLogLevel` functions
- Added an `envLogLevelName` setting to enable configuration of the name of the environment variable in which to look 
  for a logLevel on `process.env` (defaults to 'LOG_LEVEL' if undefined)
- Enabled overriding of configured logLevel via `process.env[envLogLevelName]`, where `envLogLevelName` refers to the 
  configured name of the environment variable in which to look for a logLevel on `process.env`
- Updated `core-functions` dependency to version 3.0.0
  
### 3.0.12
- Updated `core-functions` dependency to version 2.0.14
  
### 3.0.11
- Updated `core-functions` dependency to version 2.0.13
  
### 3.0.10
- Updated `core-functions` dependency to version 2.0.12
  
### 3.0.9
- Improved `LoggingSettings` & `LoggingOptions` typedefs in `type-defs.js` module

### 3.0.8
- Moved all typedefs from `logging.js` module to new `type-defs.js` module

### 3.0.7
- Added `Logging` typedef
- Changed return types of `configureLogging`, `configureLoggingWithSettings` and `configureDefaultLogging` functions 
  to new `Logging` type
 
### 3.0.6
- Updated `core-functions` dependency to version 2.0.11

### 3.0.5
- Changed 'Logging was configured without settings or options' warning to use `JSON.stringify` instead of 
  `Strings.stringify` to avoid verbose logging of all of `console` object's properties and functions
  
### 3.0.4
- Updated `core-functions` dependency to version 2.0.10

### 3.0.3
- Updated `core-functions` dependency to version 2.0.9

### 3.0.2
- Updated `core-functions` dependency to version 2.0.8

### 3.0.1
- Updated `core-functions` dependency to version 2.0.7
- Updated `tape` dependency to 4.6.3

### 3.0.0
- Changes to `logging.js` module:
  - Renamed `configureLogging` function to `configureLoggingWithSettings`
  - Renamed `configureLoggingWithSettingsOrOptions` function to `configureLogging`
  - Removed `configureLoggingIfNotConfigured` function
- Updated `core-functions` dependency to version 2.0.5

### 2.0.4
- Changes to `logging.js` module:
  - Added new `configureLoggingWithSettingsOrOptions` function to simplify programmatic configuration
  
### 2.0.3
- Changes to `logging.js` module:
  - Added missing return value to `configureLoggingIfNotConfigured` function

### 2.0.2
- Changes to `logging.js` module:
  - Added a convenience `configureLoggingIfNotConfigured` function

### 2.0.1
- Changes to `logging.js` module:
  - Changed `configureDefaultLogging` function to accept a new `options` argument of type `LoggingOptions` 
    to enable optional, partial overriding of default logging settings
  - Renamed `getLoggingSettingsOrDefaults` function to `getDefaultLoggingSettings`

### 2.0.0
- Changed `logging-utils` configuration API to synchronize with similar changes done to `aws-core-utils/stages` 
  configuration and `aws-stream-consumer/stream-processing` configuration.
  - Changed `configureLogging` function API to replace multiple arguments with single `settings` argument
  - Added `getLoggingSettingsOrDefaults` function to facilitate overriding default settings
  - Changed `configureDefaultLogging` function to use new `getLoggingSettingsOrDefaults` function
  - Added typedefs for `LoggingSettings` and `LoggingOptions` to better define parameter and return types
  - Removed obsolete `configureLoggingFromConfig` function
  - Removed obsolete `finaliseLogLevel`, `finaliseUseLevelPrefixes` and `finaliseUseConsoleTrace` functions
  - Removed `defaultLogLevel`, `defaultUseLevelPrefixes` and `defaultUseConsoleTrace` properties & config.json settings 
  - Fixed unit tests to synchronize with API changes
- Renamed `logging-utils` module to `logging` module.
  
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
