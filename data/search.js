var db = require("../db");
var common = require("./common");
var TYPES = require('tedious').TYPES


/*
const dbObjects = {
    prisonNumber:{
        columnName: "PK_PRISON_NUMBER"
    },
    
    dobOrAge: {
        columnName: "INMATE_BIRTH_DATE",
        getDatRange: function(v){
            
        }
    },
    
    forename: {
        columnName: "INMATE_FORENAME_1"
    },
    
    forename2: {
        columnName: "INMATE_FORENAME_2"
    },
    
    surname: {
        columnName: "INMATE_SURNAME"
    },
    
}
*/



function getType(v){
    //default type
    return TYPES.VarChar;
}


function getValue(userInput, key){
    return userInput[key];
}


module.exports = {
    inmate: function(user_input, callback){
  
        
/*
var sqlWhere = "",
    params = Array();

Object.keys(user_input).forEach(function (key) {
    var obj = dbObjects[key];
    
    sqlWhere += obj.columnName + " = @" + key + " AND ";
    params.push({column: 'prison_number', type: dbObjects.getType('varchar'), value: getValue(user_input, key)});
});
*/        
        
        // build sql
        var sql_where = "",
            TYPES = require('tedious').TYPES,
            params = [];
        
        var params_count = 0;

        Object.keys(user_input).forEach(function (key) {
            var val = user_input[key];
                                
            if(val.length > 0 ){
                switch(key){
                    case 'prison_number':
                        sql_where += "PK_PRISON_NUMBER = @prison_number AND ";
                        params[params_count++] = {column: 'prison_number', type: TYPES.VarChar, value: val};
                        break;
                        
                    case 'dobOrAge':
                        
                        if(val == 'age'){

                            val = user_input['age'];
                            if (val.indexOf('-') === -1){
                                var birthYear = parseInt(new Date().getFullYear()) - val;
                                arrDateRange = [birthYear+'0101',birthYear+'1231'];
                            } else {
                                var val = val.split('-'),
                                    yearFrom = parseInt(new Date().getFullYear()) - val[1].trim(),
                                    yearTo   = parseInt(new Date().getFullYear()) - val[0].trim();
                                arrDateRange = [yearFrom+'0101',yearTo+'1231'];
                            }
                        
                            sql_where += "(INMATE_BIRTH_DATE >= @from_date AND INMATE_BIRTH_DATE <= @to_date) AND ";
                            params[params_count++] = {column: 'from_date', type: TYPES.VarChar, value: arrDateRange[0]};
                            params[params_count++] = {column: 'to_date', type: TYPES.VarChar, value: arrDateRange[1]};
                        } else {
                            sql_where += "INMATE_BIRTH_DATE = @dob AND ";
                            val = user_input['dob_year']+common.pad(user_input['dob_month'])+common.pad(user_input['dob_day']);
                            params[params_count++] = {column: 'dob', type: TYPES.VarChar, value: val};
                        }
                        break;


                    case 'forename':
                        sql_where += "INMATE_FORENAME_1 = @forename AND ";
                        params[params_count++] = {column: 'forename', type: TYPES.VarChar, value: val};
                        break;

                    case 'forename2':
                        sql_where += "INMATE_FORENAME_2 = @forename2 AND ";
                        params[params_count++] = {column: 'forename2', type: TYPES.VarChar, value: val};
                        break;

                    case 'surname':
                        sql_where += "INMATE_SURNAME = @surname AND ";
                        params[params_count++] = {column: 'surname', type: TYPES.VarChar, value: val};
                        break;


                    default:
                        //return callback(new Error('Invalid user input key'))
                        break;
                }
            }
        });
        
        sql_where = sql_where.substr(0, (sql_where.length - String('AND ').length)); //remove the trailing 'AND '
        
        var sql = "SELECT INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2, FORMAT(INMATE_BIRTH_DATE,'dd/MM/yyyy') AS DOB FROM IIS.LOSS_OF_LIBERTY WHERE " +  sql_where;
                             
        db.getCollection(sql, params, function(err, rows){

            if(err) return callback(err);
            
            return callback(null, rows);
        });

    }
}


/*LEFT JOIN IIS.KNOWN_AS ON LOSS_OF_LIBERTY.FK_PERSON_IDENTIFIER = KNOWN_AS.FK_PERSON_IDENTIFIER*/
