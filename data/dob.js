'use strict';

var content = require('./content.js');

module.exports = {
    validate: function (obj, callback) {
        if (obj.age.length > 0) {
            return callback(validateAge(obj.age));
        }

        var err = {
            title: content.errMsg.CANNOT_SUBMIT,
            items: [{dobDay: 'Enter date of birth'}],
            desc: content.errMsg.INVALID_DOB
        };


        var day = obj.dobDay,
            month = obj.dobMonth,
            year = obj.dobYear;

        if (!isDate(day + '-' + month + '-' + year)) {
            return callback(err);
        }

        var dob = new Date(year, month, day);
        if (dob > Date.now()) {
            return callback(err);
        }

        return callback(null);
    }
};

function isDate(v) {
    return /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(v);
}


function validateAge(v) {
    var err = {
        title: content.errMsg.CANNOT_SUBMIT,
        items: [{agRange: 'Re-enter age or range'}],
        desc: content.errMsg.INVALID_AGE
    };

    if (!isAgeOrAgeRange(v.replace(/ /g, ''))) {
        return err;
    }

    return null;
}


function isAgeOrAgeRange(v) {
    if (!/^[1-9][0-9]$|^[1-9][0-9]-[1-9][0-9]$/.test(v)) {
        return false;
    }

    if (v.indexOf('-') === -1) {
        return true;
    }
    else {
        v = v.split('-');
        return (v[0] <= v[1]);
    }
}
