'use strict';

let content = require('./content.js');

function validateInputs(err, obj) {

    err.items = [];

    let errCount = 0;

    if (obj.forename && !isString(obj.forename)) {
        err.items[errCount++] = {forename: 'Correct the forename'};
    }
    if (obj.forename2 && !isString(obj.forename2)) {
        err.items[errCount++] = {forename2: 'Correct the middle name'};
    }
    if (obj.surname && !isString(obj.surname)) {
        err.items[errCount++] = {surname: 'Correct the surname'};
    }

    return errCount;
}

module.exports = {

    validate: function(obj, callback) {

        let err = {
            title: content.errMsg.CANNOT_SUBMIT,
            items: [{forename: 'Enter forename'}, {forename2: 'Enter middle name'}, {surname: 'Enter surname'}]
        };

        if (!obj.forename && !obj.forename2 && !obj.surname) {
            err.desc = content.errMsg.ATLEAST_ONE_REQUIRED;
            return callback(err);
        }

        let errCount = validateInputs(err, obj);

        if (errCount > 0) {
            err.desc = content.errMsg.LETTERS_ONLY;
            return callback(err);
        }

        return callback(null);
    }
};


function isString(v) {
    return /^[\sA-Za-z%_'-]+$/.test(v);
}
