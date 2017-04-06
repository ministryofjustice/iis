'use strict';
require('./azure-appinsights');

const logger = require('./log');
const config = require('./server/config');
const app = require('./server/app');
const healthcheck = require('./server/healthcheck');

if (config.healthcheckInterval) {
    reportHealthcheck();
    setInterval(reportHealthcheck, config.healthcheckInterval * 60 * 1000);

    function reportHealthcheck() {
        healthcheck((err, results) => {
            if (err) {
                logger.error('healthcheck failed', err);
            } else {
                logger.info('healthcheck', results);
            }
        });
    }
}

app.listen(app.get('port'), function() {
    logger.info('IIS server listening on port ' + app.get('port'));
});
