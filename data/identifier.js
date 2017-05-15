'use strict';

const content = require('./content.js');

module.exports = {

    validate: function(input, callback) {

        let minimumErr = {
            title: content.errMsg.CANNOT_SUBMIT,
            items: [{prisonNumber: 'Enter prison number'}, {pncNumber: 'Enter PNC number'}, {croNumber: 'Enter CRO number'}],
            desc: content.errMsg.ATLEAST_ONE_REQUIRED
        };

        if (!input.prisonNumber && !input.pncNumber && !input.croNumber) {
            return callback(minimumErr);
        }

        let formatErr = {
            title: content.errMsg.CANNOT_SUBMIT,
            items: [{prisonNumber: 'Re-enter the prison number'}],
            desc: content.errMsg.INVALID_ID
        };

        if (input.prisonNumber && !isPrisonNumber(input.prisonNumber)) {
            return callback(formatErr);
        }

        return callback(null);
    }
};

function isPrisonNumber(v) {
    return /^[A-Za-z0-9]{1,8}$/.test(v);
}
