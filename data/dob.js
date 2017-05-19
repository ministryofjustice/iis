'use strict';

let content = require('./content.js');

module.exports = {

    validate: function(obj, callback) {

        if (obj.dobOrAge == 'age') {
            return callback(validateAge(obj.age));
        }

        let err = {
            title: content.errMsg.CANNOT_SUBMIT,
            items: [{dobDay: 'Enter date of birth'}],
            desc: content.errMsg.INVALID_DOB
        };

        let day = obj.dobDay;
        let month = obj.dobMonth;
        let year = obj.dobYear;

        if (!isDate(day + '-' + month + '-' + year)) {
            return callback(err);
        }

        let dob = new Date(year, month, day);
        if (dob > Date.now()) {
            return callback(err);
        }

        return callback(null);
    }
};

function isDate(v) {
    // eslint-disable-next-line
    return /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(v);
}


function validateAge(v) {
    let err = {
        title: content.errMsg.CANNOT_SUBMIT,
        items: [{agRange: 'Re-enter age or range'}],
        desc: content.errMsg.INVALID_AGE
    };

    if (!isAgeOrAgeRange(v.replace(/ /g, ''))) {

        if (v.indexOf('-') >= 0) {
            err.desc = content.errMsg.INVALID_AGE_RANGE;
        }

        return err;
    }

    return null;
}


function isAgeOrAgeRange(v) {
    // eslint-disable-next-line
    if (!/^[1-9][0-9]$|^[1][0-9][0-9]$|^[1-9][0-9]-[1-9][0-9]|^[1-9][0-9]-[1][0-9][0-9]|^[1][0-9][0-9]-[1][0-9][0-9]$/.test(v)) {
        return false;
    }

    if (v.indexOf('-') === -1) {
        return true;
    }

    v = v.split('-');

    if (v[0] >= v[1]) {
        return false;
    }

    return ((v[1] - v[0]) < 6);
}
