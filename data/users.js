'use strict';

var db = require('../server/db');
var bcrypt = require('bcryptjs');

module.exports = {
    checkUsernameAndPassword: function (loginId, pwd, callback) {

        var TYPES = require('tedious').TYPES;
        var params = [{column: 'loginId', type: TYPES.VarChar, value: loginId}];

        db.getTuple('SELECT pwd from NON_IIS.users WHERE login_id=@loginId;', params, function (err, cols) {

            if (err) {
                return callback(err);
            }
            if (cols === 0) {
                return callback(null, false);
            }

            var hash = cols.pwd.value;
            bcrypt.compare(pwd, hash, function (err, outcome) {
                return callback(null, outcome);
            });
        });
    }
};
