const logger = require('../log');
const audit = require('../data/audit');

exports.getIndex = function(req, res) {
    logger.debug('GET /admin');

    audit.getLatestActions().then(data => {
        return res.render('admin', {
            content: {title: 'Admin'},
            latestAccess: data
        });
    }).catch(error => {
        logger.error('Error accessing latest actions', error.message);
    });
};
