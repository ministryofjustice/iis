var db = require("../db");
var utils = require("./utils");
var TYPES = require('tedious').TYPES



const filters = {
    prison_number: {
        dbColumn: "PK_PRISON_NUMBER",
        getSql: getSqlWithParams
    },
    
    forename: {
        dbColumn: "INMATE_FORENAME_1",
        getSql: getSqlWithParams
    },
    
    forename2: {
        dbColumn: "INMATE_FORENAME_2",
        getSql: getSqlWithParams
    },

    surname: {
        dbColumn: "INMATE_SURNAME",
        getSql: getSqlWithParams
    },
    
    dob_day: {
        dbColumn: "INMATE_BIRTH_DATE",
        getSql: function(obj){
            
            if(obj.userInput['dobOrAge'] != 'dob') return null;
            
            obj.val = obj.userInput['dob_year'] + 
                utils.pad(obj.userInput['dob_month']) + 
                utils.pad(obj.userInput['dob_day']);
            
            return getSqlWithParams.call(this, obj);
        }
    },

    age: {
        dbColumn: "INMATE_BIRTH_DATE",
        getSql: function(obj){
            
            if(obj.userInput['dobOrAge'] != 'age') return null;
            
            var dateRange = utils.getDateRange(obj.userInput['age']);
            
            var sql = "(INMATE_BIRTH_DATE >= @from_date AND INMATE_BIRTH_DATE <= @to_date)";
            return {sql: sql, 
                    params: [{column: 'from_date', type: getType('string'), value: dateRange[0]},
                             {column: 'to_date',   type: getType('string'), value: dateRange[1]}]
                   };
        }
        
    }
}


function getSqlWithParams(obj){   
    var sql = this.dbColumn  + " = @" + this.dbColumn;
    
    return {sql: sql, 
            params: [{column: this.dbColumn, type: getType('string'), value: obj.val}]};
}

function getType(v){
    //default type
    return TYPES.VarChar;
}
                                 

module.exports = {
    inmate: function(userInput, callback){
        var sqlWhere = "",
            params = Array();

        Object.keys(userInput).forEach(function(key) {
            var val = userInput[key];

            if( val.length === 0) return;

            if(!filters[key]) return;

            var obj = filters[key].getSql({val: val, userInput: userInput});
            
            if(obj !== null){
                params = params.concat(obj.params);
                sqlWhere += (sqlWhere !== "") ? " AND " + obj.sql : obj.sql;
            }
        });
   
        var sql = "SELECT PK_PRISON_NUMBER, INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2, FORMAT(INMATE_BIRTH_DATE,'dd/MM/yyyy') AS DOB FROM IIS.LOSS_OF_LIBERTY WHERE " +  sqlWhere;
        
        db.getCollection(sql, params, function(err, rows){
            if(err) return callback(err);
            return callback(null, rows);
        });
    }
}


/*LEFT JOIN IIS.KNOWN_AS ON LOSS_OF_LIBERTY.FK_PERSON_IDENTIFIER = KNOWN_AS.FK_PERSON_IDENTIFIER*/
