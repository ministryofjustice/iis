const config = require('./config');
const db = require('./iisData');
const logger = require('../log.js');

const superagent = require('superagent');
const url = require('url');

const checks = {
    db: () => {
        return new Promise((resolve, reject) => {
            db.getCollection('SELECT 1 AS [ok]', null, data=>{resolve('OK')}, reject);
        });
    },
    nomis: nomisApiCheck
};

function nomisApiCheck() {
    return new Promise((resolve, reject) => {
        if (!config.nomis.enabled) {
            resolve('OK - not enabled');
            return;
        }

        superagent
            .get(url.resolve(`${config.nomis.apiUrl}`, '/api/v2/prisoners'))
            .timeout({
                response: 2000,
                deadline: 2500,
            })
            .end((error, result) => {
                try {
                    if (error) {
                        //logger.error(error, 'Error calling NOMIS REST service');

                        // todo need a healthcheck endpoint. For now just expect 401
                        if (error.status === 401) {
                            return resolve('OK');
                        }

                        return reject(error);
                    }

                    if (result.status === 200) {
                        return resolve('OK');
                    }

                    return reject(`Unexpected status: ${result.status}`);
                } catch (exception) {
                    logger.error(exception, 'Exception calling NOMIS REST service');
                    return reject(exception);
                }
            });
    });
}

module.exports = function healthcheck(callback) {
    let pending = 0;
    const results = {
        healthy: true,
        checks: {}
    };
    Object.keys(checks).forEach(checkName => {
        pending += 1;
        checks[checkName]()
            .then((message) => {
                results.checks[checkName] = message;
                pending -= 1;
                finalize();
            }).catch(error => {
            results.healthy = false;
            results.checks[checkName] = error.message;
            pending -= 1;
            finalize();
        });
    });

    function finalize() {
        if (pending) {
            return;
        }

        results.uptime = process.uptime();

        try {
            results.build = require('../build-info.json');
        } catch (ex) {
            // no build info to show
        }

        try {
            results.version = require('../package.json').version;
        } catch (ex) {
            // no version info to show
        }

        callback(null, results);
    }
};
