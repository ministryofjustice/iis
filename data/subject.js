'use strict';

let db = require('../server/db');
let TYPES = require('tedious').TYPES;
let utils = require('../data/utils');


module.exports = {

    info: function(prisonNumber, callback) {
        let params = [
            {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
        ];

        /* eslint-disable */
        let sql = `SELECT 
                            PK_PRISON_NUMBER, 
                            INMATE_SURNAME, 
                            INMATE_FORENAME_1, 
                            INMATE_FORENAME_2
                    FROM 
                            IIS.LOSS_OF_LIBERTY 
                    WHERE 
                            PK_PRISON_NUMBER = @PK_PRISON_NUMBER;`;
        /* eslint-enable */

        db.getTuple(sql, params, function(err, cols) {
            if (err || cols === 0) {
                return callback(new Error('No results'));
            }

            return callback(null, formatInfoRow(cols));
        });
    },

    summary: function(obj, callback) {
        let params = [
            {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
        ];

        /* eslint-disable */
        let sql = `SELECT 
                            PK_PRISON_NUMBER, 
                            INMATE_SURNAME, 
                            INMATE_FORENAME_1, 
                            INMATE_FORENAME_2,
                            INMATE_BIRTH_DATE DOB, 
                            FK_PERSON_IDENTIFIER,
                            (
                            SELECT 
                                    CODE_DESCRIPTION 
                            FROM 
                                    IIS.IIS_CODE 
                            WHERE 
                                    PK_CODE_TYPE = 14 
                            AND 
                                    PK_CODE_REF=LOSS_OF_LIBERTY.BIRTH_COUNTRY_CODE
                            ) BIRTH_COUNTRY,

                            (
                            SELECT 
                                    CODE_DESCRIPTION 
                            FROM    
                                    IIS.IIS_CODE 
                            WHERE 
                                    PK_CODE_TYPE = 63 
                            AND 
                                    PK_CODE_REF=LOSS_OF_LIBERTY.MARITAL_STATUS_CODE
                            ) MARITAL_STATUS,

                            (
                            SELECT 
                                    CODE_DESCRIPTION 
                            FROM 
                                    IIS.IIS_CODE 
                            WHERE 
                                    PK_CODE_TYPE = 22 
                            AND 
                                    PK_CODE_REF=LOSS_OF_LIBERTY.ETHNIC_GROUP_CODE
                            ) ETHNICITY,

                            (
                            SELECT 
                                    CODE_DESCRIPTION 
                            FROM 
                                    IIS.IIS_CODE 
                            WHERE 
                                    PK_CODE_TYPE = 25 
                            AND 
                                    PK_CODE_REF=LOSS_OF_LIBERTY.NATIONALITY_CODE
                            ) NATIONALITY,

                            (
                            CASE INMATE_SEX 
                            WHEN 'M' THEN 'Male' 
                            WHEN 'F' THEN 'FEMALE' 
                            ELSE '' 
                            END
                            ) INMATE_SEX

                    FROM 
                            IIS.LOSS_OF_LIBERTY 
                    WHERE 
                            PK_PRISON_NUMBER = @PK_PRISON_NUMBER;`;
        /* eslint-enable */

        db.getTuple(sql, params, function(err, cols) {
            if (err || cols === 0) {
                return callback(new Error('No results'));
            }

            return callback(null, formatSummaryRow(cols));
        });
    },

    movements: function(obj, callback) {
        let params = [
            {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
        ];

        /* eslint-disable */
        let sql = `SELECT  
                            DATE_OF_MOVE, 
                            MOVEMENT_CODE, 
                            TYPE_OF_MOVE,
                            (
                             SELECT 
                                    ESTABLISHMENT_NAME 
                             FROM 
                                    IIS.ESTABLISHMENT 
                             WHERE 
                                    PK_ESTABLISHMENT_CODE = SUBSTRING(ESTAB_COMP_OF_MOVE,1,2)
                            ) ESTAB_COMP_OF_MOVE, 
                            (
                             CASE TYPE_OF_MOVE
                             WHEN 'R' 
                                    THEN (
                                            SELECT 
                                                    CODE_DESCRIPTION 
                                            FROM 
                                                    IIS.IIS_CODE 
                                            WHERE 
                                                    PK_CODE_TYPE=34 
                                            AND 
                                                    PK_CODE_REF = MOVEMENT_CODE
                                         )
                                    ELSE 
                                         (
                                            SELECT 
                                                    CODE_DESCRIPTION 
                                            FROM 
                                                    IIS.IIS_CODE 
                                            WHERE 
                                                    PK_CODE_TYPE=35 
                                            AND 
                                                    PK_CODE_REF = MOVEMENT_CODE
                                         )
                             END
                            ) STATUS
                    FROM 
                            IIS.INMATE_MOVEMENT 
                    WHERE 
                            FK_PRISON_NUMBER = @FK_PRISON_NUMBER 
                    ORDER BY 
                            DATE_OF_MOVE DESC, TIME_OF_MOVE DESC;`;
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
        let sql = `SELECT 
                            PERSON_SURNAME, 
                            PERSON_FORENAME_1, 
                            PERSON_FORENAME_2, 
                            PERSON_BIRTH_DATE
                    FROM 
                            IIS.KNOWN_AS
                    WHERE 
                            FK_PERSON_IDENTIFIER = @FK_PERSON_IDENTIFIER;`;
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
        let sql = `SELECT 
                            INMATE_ADDRESS_1, 
                            INMATE_ADDRESS_2,
                            INMATE_ADDRESS_3,
                            INMATE_ADDRESS_4,
                            INMATE_ADDRESS_5,
                            INMATE_POSTCODE
                    FROM 
                            IIS.INMATE_ADDRESS
                    WHERE 
                            FK_PRISON_NUMBER = @FK_PRISON_NUMBER;`;

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
        let sql = `SELECT 
                            o.IIS_OFFENCE_CODE, 
                            c.CASE_DATE, 
                            c.CASE_ESTAB_COMP_CODE,
                            (
                             SELECT 
                                    ESTABLISHMENT_NAME 
                             FROM 
                                    IIS.ESTABLISHMENT 
                             WHERE 
                                    PK_ESTABLISHMENT_CODE = SUBSTRING(c.CASE_ESTAB_COMP_CODE,1,2)
                            ) ESTABLISHMENT
                    FROM 
                            IIS.CASE_OFFENCE o, 
                            IIS.INMATE_CASE c
                    WHERE 
                            c.PKTS_INMATE_CASE = o.FK_CASE
                    AND 
                            c.FK_PRISON_NUMBER = @FK_PRISON_NUMBER;`;
        /* eslint-enable */

        db.getCollection(sql, params, function(err, rows) {
            if (err) {
                return callback(new Error('No results'));
            }

            return callback(null, rows.length > 0 ? rows.map(formatOffenceRows) : 0);
        });
    },

    hdcinfo: function(obj, callback) {
        let params = [
            {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
        ];

        /* eslint-disable */
        let sql = `SELECT 
                            h.STAGE_DATE,
                            (
                            SELECT 
                                    CODE_DESCRIPTION 
                            FROM 
                                    IIS.IIS_CODE 
                            WHERE 
                                    PK_CODE_TYPE=118 
                            AND 
                                    PK_CODE_REF_NUM = h.STAGE
                            ) STAGE,

                            (
                            SELECT 
                                    CODE_DESCRIPTION 
                            FROM 
                                    IIS.IIS_CODE 
                            WHERE 
                                    PK_CODE_TYPE=119 
                            AND 
                                    PK_CODE_REF_NUM = h.HDC_STATUS
                            ) STATUS
                    FROM 
                            IIS.HDC_HISTORY h
                    WHERE 
                            h.FK_PRISON_NUMBER = @FK_PRISON_NUMBER
                    ORDER BY 
                            STAGE_DATE DESC;`;
        /* eslint-enable */

        db.getCollection(sql, params, function(err, rows) {
            if (err) {
                return callback(new Error('No results'));
            }

            return callback(null, rows.length > 0 ? rows.map(formatHdcInfoRows) : 0);
        });
    }

};

function formatInfoRow(dbRow) {
    return {
        prisonNumber: dbRow.PK_PRISON_NUMBER.value,
        surname: dbRow.INMATE_SURNAME.value,
        forename: dbRow.INMATE_FORENAME_1.value,
        forename2: dbRow.INMATE_FORENAME_2.value
    };
}

function formatSummaryRow(dbRow) {
    return {
        dob: utils.getFormattedDateFromString(dbRow.DOB.value),
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
        date: utils.getFormattedDateFromString(dbRow.DATE_OF_MOVE.value),
        code: dbRow.MOVEMENT_CODE.value,
        type: dbRow.TYPE_OF_MOVE.value,
        status: dbRow.STATUS.value

    };
}

function formatAliasRows(dbRow) {
    return {
        surname: dbRow.PERSON_SURNAME.value,
        forename: dbRow.PERSON_FORENAME_1.value,
        forename2: dbRow.PERSON_FORENAME_2.value,
        dob: utils.getFormattedDateFromString(dbRow.PERSON_BIRTH_DATE.value)
    };
}

function formatAddressRows(dbRow) {
    return {
        addressLine1: dbRow.INMATE_ADDRESS_1.value,
        addressLine2: dbRow.INMATE_ADDRESS_2.value,
        addressLine3: dbRow.INMATE_ADDRESS_3.value,
        addressLine4: dbRow.INMATE_ADDRESS_4.value,
        addressLine5: dbRow.INMATE_ADDRESS_5.value,
        postcode: dbRow.INMATE_POSTCODE.value
    };
}

function formatOffenceRows(dbRow) {
    return {
        offenceCode: dbRow.IIS_OFFENCE_CODE.value,
        caseDate: utils.getFormattedDateFromString(dbRow.CASE_DATE.value),
        establishment_code: dbRow.CASE_ESTAB_COMP_CODE.value,
        establishment: dbRow.ESTABLISHMENT.value
    };
}

function formatHdcInfoRows(dbRow) {
    return {
        date: utils.getFormattedDateFromString(dbRow.STAGE_DATE.value),
        stage: dbRow.STAGE.value,
        status: dbRow.STATUS.value
    };
}
