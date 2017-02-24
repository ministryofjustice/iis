var db = require("../db");

module.exports = {
    inmate: function(user_input, callback){
        
        
        // build sql
        var sql_where = "",
            TYPES = require('tedious').TYPES,
            params = [];
        
        var params_count = 0;
        
        Object.keys(user_input).forEach(function (key) {
            
            
            if(sql_where != "")
                sql_where += " AND ";
            
            switch(key){
                case 'prison_number':
                    sql_where += "PK_PRISON_NUMBER = @prison_number";
                    params[params_count++] = {column: 'prison_number', type: TYPES.VarChar, value: user_input[key]};
                    break;
                    
                case 'age_or_dob':
                    console.log(user_input[key][0], user_input[key][1])
                    if(Array.isArray(user_input[key])){
                        sql_where += "(INMATE_BIRTH_DATE >= @from_date AND INMATE_BIRTH_DATE <= @to_date)";
                        params[params_count++] = {column: 'from_date', type: TYPES.VarChar, value: user_input[key][0]};
                        params[params_count++] = {column: 'to_date', type: TYPES.VarChar, value: user_input[key][1]};
                    } else {
                        sql_where += "INMATE_BIRTH_DATE = @dob";
                        params[params_count++] = {column: 'dob', type: TYPES.VarChar, value: user_input[key]};
                    }
                    
                    break;
                    
                case 'forename':
                    sql_where += "INMATE_FORENAME_1 = @forename";
                    params[params_count++] = {column: 'forename', type: TYPES.VarChar, value: user_input[key]};
                    break;
                    
                case 'forename2':
                    sql_where += "INMATE_FORENAME_2 = @forename2";
                    params[params_count++] = {column: 'forename2', type: TYPES.VarChar, value: user_input[key]};
                    break;
                    
                case 'surname':
                    sql_where += "INMATE_SURNAME = @surname";
                    params[params_count++] = {column: 'surname', type: TYPES.VarChar, value: user_input[key]};
                    break;
                    
                    
                default:
                    return callback(new Error('Invalid user input key'))
                    break;
            }
        });
        
        var sql = "SELECT INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2, FORMAT(INMATE_BIRTH_DATE,'dd/MM/yyyy') AS DOB FROM IIS.LOSS_OF_LIBERTY WHERE " + sql_where;
        
        console.log(sql)
        
        /*LEFT JOIN IIS.KNOWN_AS ON LOSS_OF_LIBERTY.FK_PERSON_IDENTIFIER = KNOWN_AS.FK_PERSON_IDENTIFIER*/
        
        db.getCollection(sql, params, function(err, rows){
            
            db.disconnect();

            if(err) return callback(err);
            
            return callback(null, rows);
        });

    }
}


