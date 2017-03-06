var db = require("../server/db");
var utils = require("./utils");
var TYPES = require('tedious').TYPES

module.exports = {
    details: function (id, callback){

        var sqlWhere = "PK_PRISON_NUMBER = @PK_PRISON_NUMBER",
            sql = '';
        
        sql += "SELECT PK_PRISON_NUMBER, INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2,";
        sql += "FORMAT(INMATE_BIRTH_DATE,'dd/MM/yyyy') AS DOB, DATEDIFF(year, INMATE_BIRTH_DATE, GETDATE()) AS AGE,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 14 AND PK_CODE_REF=LOSS_OF_LIBERTY.BIRTH_COUNTRY_CODE) AS BIRTH_COUNTRY,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 63 AND PK_CODE_REF=LOSS_OF_LIBERTY.MARITAL_STATUS_CODE) AS MARITAL_STATUS,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 22 AND PK_CODE_REF=LOSS_OF_LIBERTY.ETHNIC_GROUP_CODE) AS ETHNICITY,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 25 AND PK_CODE_REF=LOSS_OF_LIBERTY.NATIONALITY_CODE) AS NATIONALITY,";
        sql += "CASE INMATE_SEX WHEN 'M' THEN 'Male' WHEN 'F' THEN 'FEMALE' ELSE '' END AS INAMTE_SEX";
        sql += " FROM IIS.LOSS_OF_LIBERTY WHERE ";
        sql += sqlWhere + ";";
                
        params = [{column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: id}];
    
        db.getTuple(sql, params, function(err, cols){            
            if(err || cols == 0) return callback(new Error('No results'));
            return callback(null, cols);
        });
    }
}
