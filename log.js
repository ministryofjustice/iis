'use strict';

let logger = require('winston');

if (process.env.NODE_ENV === 'test') {
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.File, {filename: 'hoa-ui.log' });

} else {
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        prettyPrint: true,
        colorize: true,
        silent: false,
        timestamp: true
        // json: true
    });
}

module.exports=logger;
