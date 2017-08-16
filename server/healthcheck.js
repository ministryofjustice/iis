const {dbCheck} = require('../data/healthcheck');

function db() {
    return dbCheck()
        .then(() => ({name: 'db', status: 'ok', message: 'ok'}))
        .catch(err => ({name: 'db', status: 'ERROR', message: err.message}));
}

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
    const checks = [db];

    return Promise
        .all(checks.map(fn => fn()))
        .then(checkResults => {
            const allOk = checkResults.every(item => item.status === 'ok');
            const result = {
                healthy: allOk,
                checks: checkResults.reduce(gatherCheckInfo, {})
            };
            callback(null, addAppInfo(result));
        });
};

function gatherCheckInfo(total, currentValue) {
    return Object.assign({}, total, {[currentValue.name]: currentValue.message});
}

function addAppInfo(result) {
    const buildInfo = {
        uptime: process.uptime(),
        build: getBuild(),
        version: getVersion()
    };

    return Object.assign({}, result, buildInfo);
}

function getVersion() {
    try {
        return require('../package.json').version;
    } catch (ex) {
        return null;
    }
}

function getBuild() {
    try {
        return require('../build-info.json');
    } catch (ex) {
        return null;
    }
}

