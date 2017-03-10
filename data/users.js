'use strict';

let db = require('../server/db');
let bcrypt = require('bcryptjs');
let TYPES = require('tedious').TYPES;

let logger = require('winston');

module.exports = {

    checkUsernameAndPassword: function(loginId, pwd, callback) {

        let params = [
            {column: 'loginId', type: TYPES.VarChar, value: loginId}
        ];

        db.getTuple('SELECT pwd from NON_IIS.users WHERE login_id=@loginId;', params, function(err, cols) {

            if (err) {
                logger.error('Error finding user: ' + err);
                return callback(err);
            }
            if (cols === 0) {
                logger.error('Error finding user: ' + err);
                return callback(null, false);
            }

            let hash = cols.pwd.value;

            bcrypt.compare(pwd, hash, function(err, outcome) {
                logger.info('Authentication outcome: ' + outcome);
                return callback(null, outcome);
            });
        });
    }
};
