const db = require('./iisData');

const checks = {
    db: () => {
        return new Promise((resolve, reject) => {
            db.getTuple('SELECT 1 AS [ok]', null, resolve, reject);
        });
    }
};

module.exports = function healthcheck(callback) {
    let pending = 0;
    const results = {
        healthy: true,
        checks: {}
    };
    Object.keys(checks).forEach(checkName => {
        pending += 1;
        checks[checkName]()
            .then(() => {
                results.checks[checkName] = 'ok';
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
