'use strict';

const appInsights = require('./azure-appinsights');
const logger = require('./log');
const config = require('./server/config');
const app = require('./server/app');
const healthcheck = require('./server/healthcheck');
const {flattenMeta} = require('./server/misc');
const {getNomisToken} = require('./data/nomisSearch');

if (config.healthcheckInterval) {
    reportHealthcheck();
    setInterval(reportHealthcheck, config.healthcheckInterval * 60 * 1000);

    function reportHealthcheck() {
        healthcheck(recordHealthResult);
    }

    function recordHealthResult(err, results) {
        if (err) {
            logger.error('healthcheck failed', err);
            return;
        }
        logger.info('healthcheck', results);
        if (results.healthy && appInsights) {
            appInsights.client.trackEvent('healthy', flattenMeta(results));
        }
    }
}

if (config.nomis.enabled) {

    console.log('starting nomis session');

    getNomisToken().then(token => {
        console.log(token);
        // todo make this available to the app
    }).catch(error => {
        console.log('Failed to get token');
        console.log(error);
        return (error);
    });
}

app.listen(app.get('port'), function() {
    logger.info('IIS server listening on port ' + app.get('port'));
});
