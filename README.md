# logging-utils v1.0.0
Utilities for configuring simple log level based logging functionality on an object.

Currently includes:
- logging-utils.js - main 

This module is exported as a [Node.js](https://nodejs.org/) module.

## Installation

Using npm:
```bash
$ {sudo -H} npm i -g npm
$ npm i --save logging-utils
```

In Node.js:
```js
// To use the logging utilties

const logging = require('logging-utils');
// Logging utils Constants
//const ERROR = logging.ERROR;
//const WARN = logging.WARN;
//const INFO = logging.INFO;
//const DEBUG = logging.DEBUG;
//const TRACE = logging.TRACE;
//const defaultLogLevel = logging.defaultLogLevel;
// Logging utils functions
const isLoggingConfigured = logging.isLoggingConfigured;
const configureLogging = logging.configureLogging;

const context = configureLogging(context, )

// Local defaults
const defaultMaxNumberOfAttempts = 10;
```

## Unit tests
This module's unit tests were developed with and must be run with [tape](https://www.npmjs.com/package/tape). The unit tests have been tested on [Node.js v4.3.2](https://nodejs.org/en/blog/release/v4.3.2/).  

See the [package source](https://github.com/byron-dupreez/logging-utils) for more details.
