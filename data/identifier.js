'use strict';

let content = require('./content.js');

module.exports = {

    validate: function(input, callback) {

        let err = {
            title: content.errMsg.CANNOT_SUBMIT,
            items: [{prisonNumber: 'Re-enter the prison number'}],
            desc: content.errMsg.INVALID_ID
        };

        if (!isPrisonNumber(input.prisonNumber)) {
            return callback(err);
        }

        return callback(null);
    }
};

function isPrisonNumber(v) {
    return /^[A-Za-z0-9]{1,8}$/.test(v);
}
