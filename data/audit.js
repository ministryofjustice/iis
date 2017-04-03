'use strict';

let logger = require('../log.js');

const keys = ['LOG_IN', 'DISCLAIMER_ACCEPTED', 'SEARCH', 'VIEW'];

exports.record = function record(key, user, data) {

    if(!keys.includes(key)) {
        throw new Error(`Unknown audit key: ${key}`);
    }

    logger.audit('AUDIT', {key, user, data: data ? JSON.stringify(data) : null});
};
