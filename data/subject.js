'use strict';

let db = require('../server/db');
let TYPES = require('tedious').TYPES;

let sqlWhere = 'PK_PRISON_NUMBER = @PK_PRISON_NUMBER';

/* eslint-disable */
let sql = '';
sql += 'SELECT PK_PRISON_NUMBER, UPPER(INMATE_SURNAME) INMATE_SURNAME, UPPER(LEFT(INMATE_FORENAME_1,1))+LOWER(SUBSTRING(INMATE_FORENAME_1,2,LEN(INMATE_FORENAME_1))) INMATE_FORENAME_1, UPPER(LEFT(INMATE_FORENAME_2,1))+LOWER(SUBSTRING(INMATE_FORENAME_2,2,LEN(INMATE_FORENAME_2))) INMATE_FORENAME_2,';
sql += 'FORMAT(INMATE_BIRTH_DATE,\'dd/MM/yyyy\') AS DOB, DATEDIFF(year, INMATE_BIRTH_DATE, GETDATE()) AS AGE,';
sql += '(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 14 AND PK_CODE_REF=LOSS_OF_LIBERTY.BIRTH_COUNTRY_CODE) AS BIRTH_COUNTRY,';
sql += '(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 63 AND PK_CODE_REF=LOSS_OF_LIBERTY.MARITAL_STATUS_CODE) AS MARITAL_STATUS,';
sql += '(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 22 AND PK_CODE_REF=LOSS_OF_LIBERTY.ETHNIC_GROUP_CODE) AS ETHNICITY,';
sql += '(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 25 AND PK_CODE_REF=LOSS_OF_LIBERTY.NATIONALITY_CODE) AS NATIONALITY,';
sql += 'CASE INMATE_SEX WHEN \'M\' THEN \'Male\' WHEN \'F\' THEN \'FEMALE\' ELSE \'\' END AS INMATE_SEX';
sql += ' FROM IIS.LOSS_OF_LIBERTY WHERE ';
sql += sqlWhere + ';';
/* eslint-enable */

module.exports = {

    details: function(id, callback) {

        let params = [
            {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: id}
        ];

        db.getTuple(sql, params, function(err, cols) {
            if (err || cols === 0) {
                return callback(new Error('No results'));
            }

            return callback(null, cols);
        });
    }
};
