const logger = require('../log');
const audit = require('../data/audit');

const DATA_ERROR = {
    title: 'An error occurred retrieving audit data',
    desc: 'Please reload the page to try again'
};

exports.getIndex = function(req, res) {
    logger.info('GET /admin', req.user.email);

    audit.getLatestActions()
        .then(data => {
            return res.render('admin', {
                content: {title: 'Admin'},
                latestAccess: data
            });
        })
        .catch(error => {
            logger.error('Error accessing latest actions: ' + error.message);

            return res.render('admin', {
                content: {title: 'Admin'},
                latestAccess: [],
                err: DATA_ERROR
            });
        });
};
