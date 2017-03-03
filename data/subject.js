var db = require("../db");
var utils = require("./utils");
var TYPES = require('tedious').TYPES

module.exports = {
    details: function (id, callback){
        
        var sqlWhere = "PK_PRISON_NUMBER = @PK_PRISON_NUMBER",
            sql = "SELECT PK_PRISON_NUMBER, INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2, FORMAT(INMATE_BIRTH_DATE,'dd/MM/yyyy') AS DOB FROM IIS.LOSS_OF_LIBERTY WHERE " +  sqlWhere + ";",
            params = [{column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: id}];

        db.getTuple(sql, params, function(err, cols){            
            if(err || cols == 0) return callback(new Error('No results'));
            return callback(null, cols);
        });        
    }
}