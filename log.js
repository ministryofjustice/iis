'use strict';

let winston = require('winston');

let logLevels = {
    levels: {
        audit: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
    },
    colors: {
        audit: 'grey',
        error: 'red',
        warn: 'blue',
        info: 'green',
        debug: 'yellow'
    }
};

winston.setLevels(logLevels.levels);
winston.addColors(logLevels.colors);


if (process.env.NODE_ENV === 'test') {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.File, {
        name: 'log',
        level: 'debug',
        filename: 'iis-ui.log',
        json: false
    });
    winston.add(winston.transports.File, {
        name: 'audit',
        level: 'audit',
        filename: 'iis-ui-audit.log',
        json: false
    });

} else {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        name: 'log',
        level: 'info',
        prettyPrint: true,
        colorize: true,
        silent: false,
        timestamp: true
        // json: true
    });
    winston.add(winston.transports.Console, {
        name: 'audit',
        level: 'audit',
        prettyPrint: true,
        colorize: true,
        silent: false,
        timestamp: true
        // json: true
    });
}

module.exports = winston;
