'use strict';

let logger = require('winston');

const keys = ['LOG_IN', 'DISCLAIMER_ACCEPTED', 'SEARCH', 'VIEW'];

exports.record = function record(key, user, data) {

    if(!keys.includes(key)) {
        throw new Error(`Unknown audit key: ${key}`);
    }

    logger.audit('AUDIT', {key, user, data});
};
