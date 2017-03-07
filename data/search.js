'use strict';

let db = require('../server/db');
let utils = require('./utils');
let TYPES = require('tedious').TYPES;


const filters = {
    prisonNumber: {
        dbColumn: 'PK_PRISON_NUMBER',
        getSql: getSqlWithParams
    },

    forename: {
        dbColumn: 'INMATE_FORENAME_1',
        getSql: getSqlWithParams
    },

    forename2: {
        dbColumn: 'INMATE_FORENAME_2',
        getSql: getSqlWithParams
    },

    surname: {
        dbColumn: 'INMATE_SURNAME',
        getSql: getSqlWithParams
    },

    dobDay: {
        dbColumn: 'INMATE_BIRTH_DATE',
        getSql: function(obj) {

            if (obj.userInput.dobOrAge !== 'dob') {
                return null;
            }

            obj.val = obj.userInput.dobYear +
                utils.pad(obj.userInput.dobMonth) +
                utils.pad(obj.userInput.dobDay);

            return getSqlWithParams.call(this, obj);
        }
    },
    age: {
        dbColumn: 'INMATE_BIRTH_DATE',
        getSql: function(obj) {

            if (obj.userInput.dobOrAge !== 'age') {
                return null;
            }

            let dateRange = utils.getDateRange(obj.userInput.age);

            let sql = '(INMATE_BIRTH_DATE >= @from_date AND INMATE_BIRTH_DATE <= @to_date)';
            return {
                sql: sql,
                params: [{column: 'from_date', type: getType('string'), value: dateRange[0]},
                    {column: 'to_date', type: getType('string'), value: dateRange[1]}]
            };
        }
    }
};


function getSqlWithParams(obj) {
    let sql = this.dbColumn + ' = @' + this.dbColumn;

    return {
        sql: sql,
        params: [{column: this.dbColumn, type: getType('string'), value: obj.val}]
    };
}

function getType(v) {
    // default type
    return TYPES.VarChar;
}


module.exports = {
    inmate: function(userInput, callback) {
        let sqlWhere = '';
        let params = [];

        Object.keys(userInput).forEach(function(key) {
            let val = userInput[key];

            if (val.length === 0) {
                return;
            }

            if (!filters[key]) {
                return;
            }

            let obj = filters[key].getSql({val: val, userInput: userInput});

            if (obj !== null) {
                params = params.concat(obj.params);
                sqlWhere += (sqlWhere !== '') ? ' AND ' + obj.sql : obj.sql;
            }
        });


        // eslint-disable-next-line
        let sql = 'SELECT PK_PRISON_NUMBER, INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2, FORMAT(INMATE_BIRTH_DATE,\'dd/MM/yyyy\') AS DOB FROM IIS.LOSS_OF_LIBERTY WHERE ' + sqlWhere;

        db.getCollection(sql, params, function(err, rows) {
            if (err) {
                return callback(err);
            }

   
        var sql = "SELECT PK_PRISON_NUMBER, INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2, FORMAT(INMATE_BIRTH_DATE,'dd/MM/yyyy') AS DOB, "
        sql += "SUBSTRING((SELECT ',' + k.PERSON_FORENAME_1 + ' ' + PERSON_FORENAME_2 + ' ' + k.PERSON_SURNAME FROM IIS.KNOWN_AS k WHERE k.FK_PERSON_IDENTIFIER=l.FK_PERSON_IDENTIFIER FOR XML PATH('')),2,200000) AS ALIAS"
        sql += " FROM IIS.LOSS_OF_LIBERTY l WHERE " +  sqlWhere;
        
        db.getCollection(sql, params, function(err, rows){
            if(err) return callback(err);
            return callback(null, rows);
        });
    }
};


/* LEFT JOIN IIS.KNOWN_AS ON LOSS_OF_LIBERTY.FK_PERSON_IDENTIFIER = KNOWN_AS.FK_PERSON_IDENTIFIER */
