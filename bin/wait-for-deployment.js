const request = require('superagent');
const Throttle = require('superagent-throttle');

const throttle = new Throttle({
    active: true,
    rate: 1,
    ratePer: 5000,
    concurrent: 1
});

function log(...args) {
    /* eslint-disable no-console */
    console.log(`${new Date()}:`, ...args);
}

const pollEndpointForGitRef = (config) => {
    log('Starting polling for status endpoint, looking for', config.gitRef);

    doPoll(config);
};

const doPoll = (config) => {
    log('Pooling attempts remaining:', config.retryCount);

    if (config.retryCount === 0) {
        return config.onError();
    }

    const url = `${config.appUrl}/health`;
    log(`GET ${url}`);

    return request
        .get(url)
        .use(throttle.plugin())
        .timeout({
            response: 5000, // Wait 5 seconds for the server to be available,
            deadline: 5000  // but allow 5 seconds for request.
        })
        .end((error, response) => {

            const updatedConfig = Object.assign({}, config, {
                retryCount: config.retryCount - 1
            });

            if (error || !response.ok) {
                log('Got failed response', error, response);
                return doPoll(updatedConfig);
            }

            log('Got readable response', response.body);
            if (
                response.body && response.body.build &&
                response.body.build.gitRef === config.gitRef
            ) {
                return config.onSuccess(response.body);
            }

            return doPoll(updatedConfig);
        });
};

module.exports = pollEndpointForGitRef;
