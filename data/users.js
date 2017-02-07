var db = require("../db");

module.exports = {
    checkUsernameAndPassword: function(login_id, pwd, callback){
        var connection = db.connect();
        connection.on('connect', function(err) {
            if(err) return callback(err);
            
            var Request = require('tedious').Request;
            var TYPES = require('tedious').TYPES; 
            var bcrypt = require('bcryptjs');
            request = new Request("SELECT pwd from DBO.users WHERE login_id=@login_id;", function(err, rowCount) {
                if (err) return callback(err);
                if(rowCount === 0) return callback(null, false)
            });
            
            request.addParameter('login_id', TYPES.VarChar, login_id);  

            request.on('row', function(columns) {
                var hash = columns[0].value;
                
                bcrypt.compare(pwd, hash, function(err, outcome) {
                    callback(null, outcome);
                });
            });

            connection.execSql(request);
        });
    }
}