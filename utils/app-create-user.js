var prompt = require('prompt');
var bcrypt = require('bcryptjs');
var db = require('./../server/db');


prompt.start();
prompt.get(['username', 'email'], function (err, result) {

    var pwd = Math.random().toString(36).substr(2, 8);

    bcrypt.hash(pwd, 8, function (err, hash) {

        console.log('***************');
        console.log('Password for \'' + result.username + '\' is ' + pwd);
        //console.log('  email: ' + result.email);
        //console.log('  hash: ' + hash);
        console.log('***************');

        connection = db.connect();

        connection.on('connect', function (err) {

            if (err) {
                console.log(err);
                return;
            }

            var Request = require('tedious').Request;
            var TYPES = require('tedious').TYPES;

            request = new Request('INSERT INTO NON_IIS.users(login_id,pwd,email) VALUES(@login_id, @pwd, @email);', function (err) {

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

var dbconfig = function () {
    var config = require('config');
    return config.get('sqlserver');
};
