'use strict';

let prompt = require('prompt');
let bcrypt = require('bcryptjs');
let db = require('./../server/db');


prompt.start();
prompt.get(['username', 'email'], function(err, result) {

    let pwd = Math.random().toString(36).substr(2, 8);

    bcrypt.hash(pwd, 8, function(err, hash) {

        console.log('***************');
        console.log('Password for \'' + result.username + '\' is ' + pwd);
        // console.log('  email: ' + result.email);
        // console.log('  hash: ' + hash);
        console.log('***************');

        let connection = db.connect();

        connection.on('connect', function(err) {

            if (err) {
                console.log(err);
                return;
            }

            let Request = require('tedious').Request;
            let TYPES = require('tedious').TYPES;

            let request = new Request('INSERT INTO NON_IIS.users(login_id,pwd,email) VALUES(@login_id, @pwd, @email);',
                function(err) {

                if (err) {
                    console.log('ERROR #' + err.number + ' - User could not be created');
                } else {
                    console.log('Done!');
                }
            });

            request.addParameter('login_id', TYPES.VarChar, result.username);
            request.addParameter('pwd', TYPES.VarChar, hash);
            request.addParameter('email', TYPES.VarChar, result.email);

            connection.execSql(request);
        });
    });
});

