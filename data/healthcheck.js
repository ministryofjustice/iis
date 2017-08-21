const config = require('../server/config.js');
const {getCollection} = require('./dataAccess/iisData');
const logger = require('../log.js');

const url = require('url');
const superagent = require('superagent');

module.exports = {
    nomisApiCheck,
    dbCheck
};

function dbCheck() {
    return new Promise((resolve, reject) => {
        getCollection('SELECT 1 AS [ok]', null, resolve, reject);
    });
}

function nomisApiCheck() {
    return new Promise((resolve, reject) => {
        if (!config.nomis.enabled) {
            return resolve('Disabled');
        }

        superagent
            .get(url.resolve(`${config.nomis.apiUrl}`, '/api/info/health'))
            .timeout({
                response: 2000,
                deadline: 2500
            })
            .end((error, result) => {
                try {
                    if (error) {
                        logger.error(error, 'Error calling NOMIS REST service');
                        return reject(error.status);
                    }

                    if (result.status === 200) {
                        return resolve('OK');
                    }

                    return reject(result.status);
                } catch (exception) {
                    logger.error(exception, 'Exception calling NOMIS REST service');
                    return reject(exception);
                }
            });
    });
}

