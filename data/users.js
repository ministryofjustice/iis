var db = require("../db");
var bcrypt = require('bcryptjs');

module.exports = {
    checkUsernameAndPassword: function(login_id, pwd, callback){
        
        var TYPES = require('tedious').TYPES; 
        var params = {column: 'login_id', type: TYPES.VarChar, value: login_id };
                
        db.getTuple('SELECT pwd from NON_IIS.users WHERE login_id=@login_id;', params, function(err, cols){

            if(err) return callback(err);
            if(cols === 0) return callback(null, false);

            var hash = cols.pwd.value;
            bcrypt.compare(pwd, hash, function(err, outcome) {
                return callback(null, outcome);
            });
        });
    }
}