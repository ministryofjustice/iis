const request = require('superagent');

const POLL_INTERVAL = 5000;

function log(...args) {
    /* eslint-disable no-console */
    console.log(`${new Date()}:`, ...args);
}

const pollEndpointForGitRef = (config) => {
    log('Starting polling for status endpoint, looking for', config.gitRef);

    schedulePoll(config);
};

const schedulePoll = (config) => {
    setTimeout(() => doPoll(config), POLL_INTERVAL);
};

const doPoll = (config) => {
    log('Polling attempts remaining:', config.retryCount);

    if (config.retryCount === 0) {
        return config.onError();
    }

    const url = `${config.appUrl}/health`;
    log(`GET ${url}`);

    return request
        .get(url)
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
                return schedulePoll(updatedConfig);
            }

            log('Got readable response', response.body);
            if (
                response.body && response.body.build &&
                response.body.build.gitRef === config.gitRef
            ) {
                return config.onSuccess(response.body);
            }

            return schedulePoll(updatedConfig);
        });
};

module.exports = pollEndpointForGitRef;
