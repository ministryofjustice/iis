'use strict';

let db = require('../server/db');
let TYPES = require('tedious').TYPES;

module.exports = {

    details: function(id, callback) {
        let params = [
            {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: id}
        ];

        /* eslint-disable */
        let sql = "";
        sql += "SELECT PK_PRISON_NUMBER, INMATE_SURNAME, INMATE_FORENAME_1, INMATE_FORENAME_2,";
        sql += "INMATE_BIRTH_DATE AS DOB, FK_PERSON_IDENTIFIER,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 14 AND PK_CODE_REF=LOSS_OF_LIBERTY.BIRTH_COUNTRY_CODE) AS BIRTH_COUNTRY,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 63 AND PK_CODE_REF=LOSS_OF_LIBERTY.MARITAL_STATUS_CODE) AS MARITAL_STATUS,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 22 AND PK_CODE_REF=LOSS_OF_LIBERTY.ETHNIC_GROUP_CODE) AS ETHNICITY,";
        sql += "(SELECT CODE_DESCRIPTION FROM IIS.IIS_CODE WHERE PK_CODE_TYPE = 25 AND PK_CODE_REF=LOSS_OF_LIBERTY.NATIONALITY_CODE) AS NATIONALITY,";
        sql += "CASE INMATE_SEX WHEN 'M' THEN 'Male' WHEN 'F' THEN 'FEMALE' ELSE '' END AS INMATE_SEX";
        sql += " FROM IIS.LOSS_OF_LIBERTY WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER;";
        /* eslint-enable */

        db.getTuple(sql, params, function(err, cols) {
            if (err || cols === 0) {
                return callback(new Error('No results'));
            }

            return callback(null, formatRow(cols));
        });
    },

    summary: function(obj, callback) {
      return callback(null);
    },

    movements: function(obj, callback) {
        let params = [
            {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
        ];

        /* eslint-disable */
        let sql = "SELECT ESTAB_COMP_OF_MOVE, DATE_OF_MOVE, MOVEMENT_CODE, TYPE_OF_MOVE";
        sql += " FROM IIS.INMATE_MOVEMENT";
        sql += " WHERE FK_PRISON_NUMBER = @FK_PRISON_NUMBER";
        sql += " ORDER BY DATE_OF_MOVE DESC, TIME_OF_MOVE DESC;";
        /* eslint-enable */

        db.getCollection(sql, params, function(err, rows) {
            if (err) {
                return callback(new Error('No results'));
            }

            return callback(null, rows.length > 0 ? rows.map(formatMovementRows) : 0);
        });
    },

    aliases: function(obj, callback) {
        let params = [
            {column: 'FK_PERSON_IDENTIFIER', type: TYPES.VarChar, value: obj.personIdentifier}
        ];

        /* eslint-disable */
        let sql = "SELECT PERSON_SURNAME, PERSON_FORENAME_1, PERSON_FORENAME_2, PERSON_BIRTH_DATE";
        sql += " FROM IIS.KNOWN_AS";
        sql += " WHERE FK_PERSON_IDENTIFIER = @FK_PERSON_IDENTIFIER;";
        /* eslint-enable */

        db.getCollection(sql, params, function(err, rows) {
            if (err) {
                return callback(new Error('No results'));
            }

            return callback(null, rows.length > 0 ? rows.map(formatAliasRows) : 0);
        });
    },

    addresses: function(obj, callback) {
        let params = [
            {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
        ];

        /* eslint-disable */
        let sql = "SELECT ADDRESS_NUM, INMATE_ADDRESS_1, INMATE_ADDRESS_2";
        sql += " FROM IIS.INMATE_ADDRESS";
        sql += " WHERE FK_PRISON_NUMBER = @FK_PRISON_NUMBER;";
        /* eslint-enable */

        db.getCollection(sql, params, function(err, rows) {
            if (err) {
                return callback(new Error('No results'));
            }

            return callback(null, rows.length > 0 ? rows.map(formatAddressRows) : 0);
        });
    },

    offences: function(obj, callback) {
        let params = [
            {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
        ];

        /* eslint-disable */
        let sql = "SELECT o.IIS_OFFENCE_CODE, o.DATE_COMMITTED";
        sql += " FROM IIS.CASE_OFFENCE o, IIS.INMATE_CASE c";
        sql += " WHERE c.PKTS_INMATE_CASE = o.FK_CASE";
        sql += " AND c.FK_PRISON_NUMBER='TW007364';";
        /* eslint-enable */

        db.getCollection(sql, params, function(err, rows) {
            if (err) {
                return callback(new Error('No results'));
            }

            return callback(null, rows.length > 0 ? rows.map(formatOffenceRows) : 0);
        });
    }

};

function formatRow(dbRow) {
    return {
        prisonNumber: dbRow.PK_PRISON_NUMBER.value,
        personIdentifier: dbRow.FK_PERSON_IDENTIFIER.value,
        surname: dbRow.INMATE_SURNAME.value,
        forename: dbRow.INMATE_FORENAME_1.value,
        forename2: dbRow.INMATE_FORENAME_2.value,
        dob: dbRow.DOB.value,
        countryOfBirth: dbRow.BIRTH_COUNTRY.value,
        maritalStatus: dbRow.MARITAL_STATUS.value,
        ethnicity: dbRow.ETHNICITY.value,
        nationality: dbRow.NATIONALITY.value,
        sex: dbRow.INMATE_SEX.value
    };
}

function formatMovementRows(dbRow) {
    return {
        establishment: dbRow.ESTAB_COMP_OF_MOVE.value,
        date: dbRow.DATE_OF_MOVE.value,
        code: dbRow.MOVEMENT_CODE.value,
        type: dbRow.TYPE_OF_MOVE.value

    };
}

function formatAliasRows(dbRow) {
    return {
        surname: dbRow.PERSON_SURNAME.value,
        forename: dbRow.PERSON_FORENAME_1.value,
        forename2: dbRow.PERSON_FORENAME_2.value,
        dob: dbRow.PERSON_BIRTH_DATE.value
    };
}

function formatAddressRows(dbRow) {
    return {
        addressNumber: dbRow.ADDRESS_NUM.value,
        addressLine1: dbRow.INMATE_ADDRESS_1.value,
        addressLine2: dbRow.INMATE_ADDRESS_2.value
    };
}

function formatOffenceRows(dbRow) {
    return {
        offenceCode: dbRow.IIS_OFFENCE_CODE.value,
        dateCommitted: dbRow.DATE_COMMITTED.value
    };
}
