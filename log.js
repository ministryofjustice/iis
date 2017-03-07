let logger = require('winston');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
    // json: true
});

logger.level = 'info';

module.exports=logger;
