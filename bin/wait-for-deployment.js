const request = require('superagent');
const Throttle = require('superagent-throttle');

const throttle = new Throttle({
    active: true,
    rate: 1,
    ratePer: 5000,
    concurrent: 1,
});

const poolEndpointForGitRef = (config) => {
    /* eslint-disable no-console */
    console.log(`${new Date()}:`, 'Pooling attempts remaining:', config.retryCount);

    if (config.retryCount === 0) {
        return config.onError();
    }

    return request
        .get(`${config.appUrl}/health`)
        .use(throttle.plugin())
        .timeout({
            response: 5000, // Wait 5 seconds for the server to be available,
            deadline: 5000, // but allow 5 seconds for request.
        })
        .end((error, response) => {

            const updatedConfig = Object.assign({}, config, {
                retryCount: config.retryCount - 1,
            });

            if (error || !response.ok) {
                return poolEndpointForGitRef(updatedConfig);
            }

            if (
                response.body && response.body.build &&
                response.body.build.gitRef === config.gitRef
            ) {
                return config.onSuccess(response.body);
            }

            return poolEndpointForGitRef(updatedConfig);
        });
};

module.exports = poolEndpointForGitRef;
