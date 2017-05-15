'use strict';

const content = require('./content.js');

module.exports = {

    validate: function(input, callback) {

        let err = {
            title: content.errMsg.CANNOT_SUBMIT,
            items: [{prisonNumber: 'Enter prison number'}, {pncNumber: 'Enter PNC number'}, {croNumber: 'Enter CRO number'}],
            desc: content.errMsg.ATLEAST_ONE_REQUIRED
        };

        if (!input.prisonNumber && !input.pncNumber && !input.croNumber) {
            return callback(err);
        }

        return callback(null);
    }
};

