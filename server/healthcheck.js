const db = require('./db');

const checks = {
    db: function(callback) {
        db.getTuple('SELECT 1 AS [ok]', null, function(err, row) {
            if (err) {
                return callback(err);
            }
            if (row.ok.value !== 1) {
                return callback(new Error('DB query error'));
            }
            return callback(null);
        });
    }
};

module.exports = function healthcheck(callback) {
    let pending = 0;
    const results = {
        healthy: true,
        checks: {}
    };
    Object.keys(checks).forEach((checkName) => {
        pending += 1;
        checks[checkName]((err, result) => {
            if (err) {
                results.healthy = false;
                results.checks[checkName] = err.message;
            } else {
                results.checks[checkName] = 'ok';
            }
            pending -= 1;
            finalize();
        });
    });

    function finalize() {
        if (pending) {
            return;
        }

        results.uptime = process.uptime();
        callback(null, results);
    }
};
