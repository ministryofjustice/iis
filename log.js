'use strict';

let winston = require('winston');

winston.setLevels({
    audit: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
});
winston.addColors({
    audit: 'cyan',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'grey'
});

winston.clear();
if (process.env.NODE_ENV === 'test') {
    winston.add(winston.transports.File, {
        name: 'log',
        level: 'debug',
        filename: 'tests.log',
        json: false,
        colorize: true,
        prettyPrint: true
    });
} else if (process.env.NODE_ENV === 'production') {
    winston.add(winston.transports.Console, {
        name: 'log',
        level: 'info',
        prettyPrint: false,
        colorize: false,
        silent: false,
        timestamp: true,
        json: true,
        stringify: true,
        handleExceptions: true
    });
} else {
    winston.add(winston.transports.Console, {
        name: 'log',
        level: 'info',
        // prettyPrint: true,
        colorize: true,
        silent: false,
        timestamp: true,
        handleExceptions: true,
        json: false,
        humanReadableUnhandledException: true
    });
}

const appInsights = require('./azure-appinsights');
if (appInsights) {
    const aiLogger = require('winston-azure-application-insights');
    winston.info('Activating application insights logger');
    winston.add(aiLogger.AzureApplicationInsightsLogger, {
        insights: appInsights,
        level: 'info',
        silent: false,
        treatErrorsAsExceptions: true
    });
    aiLogger.rewriters.push(function(level, msg, meta) {
        return flattenMeta(meta);
    });
}

function flattenObject(source, target, prefix) {
    Object.keys(source).forEach(function(key) {
        let sourceVal = source[key];
        let fullKey = prefix + '_' + key;
        if (sourceVal && typeof sourceVal === "object") {
            flattenObject(sourceVal, target, fullKey)
        } else {
            target[fullKey] = sourceVal;
        }
    });
}

function flattenMeta(meta) {
    let flat = {};
    Object.keys(meta).forEach(function(key) {
        let val = meta[key];
        if (val && typeof val === "object") {
            flattenObject(val, flat, key);
        } else {
            flat[key] = val;
        }
    });
    return flat;
}

module.exports = winston;
