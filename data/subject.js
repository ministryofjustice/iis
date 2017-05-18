'use strict';

const changeCase = require('change-case');
const TYPES = require('tedious').TYPES;

const db = require('../server/db');
const {describeCode} = require('../data/codes');
const utils = require('../data/utils');
const logger = require('../log');

exports.getInfo = function(prisonNumber) {

        logger.debug('Subject info search');
        const params = [
            {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
        ];

        let sql = `SELECT 
                            PK_PRISON_NUMBER, 
                            INMATE_SURNAME, 
                            INMATE_FORENAME_1, 
                            INMATE_FORENAME_2,
                            FK_PERSON_IDENTIFIER,
                            (
                            SELECT
                              TOP 1 PERSON_IDENTIFIER_VALUE
                            FROM
                              IIS.IIS_IDENTIFIER
                            WHERE
                              PERSON_IDENT_TYPE_CODE = 'PNC'
                              AND
                              FK_PERSON_IDENTIFIER=LOSS_OF_LIBERTY.FK_PERSON_IDENTIFIER
                            ) PNC,
                            (
                            SELECT TOP 1 PERSON_IDENTIFIER_VALUE
                            FROM IIS.IIS_IDENTIFIER
                            WHERE PERSON_IDENT_TYPE_CODE = 'CRO'
                            AND FK_PERSON_IDENTIFIER=LOSS_OF_LIBERTY.FK_PERSON_IDENTIFIER
                            ) CRO,
                            (STUFF(
                                (SELECT DISTINCT ', ' + CAST(PAROLE_REF_NUMBER AS VARCHAR(7))
                                 FROM IIS.PAROLE_REVIEW
                                 WHERE FK_PRISON_NUMBER = @PK_PRISON_NUMBER
                                 FOR XML PATH('')), 1, 1, '')
                            ) PAROLE_REF_LIST
                    FROM IIS.LOSS_OF_LIBERTY 
                    WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER;`;

        logger.debug('Subject info search', sql);

        return new Promise((resolve, reject) => {
            db.getTuple(sql, params, resolveWithFormattedRow(resolve, 'info'), reject);
        });
};

exports.getSummary = function(obj) {
    logger.debug('Subject summary search');

    const params = [
        {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
    ];

    const sql = `SELECT PK_PRISON_NUMBER, 
                        INMATE_SURNAME, 
                        INMATE_FORENAME_1, 
                        INMATE_FORENAME_2,
                        INMATE_BIRTH_DATE DOB, 
                        FK_PERSON_IDENTIFIER,
                        BIRTH_COUNTRY_CODE,
                        MARITAL_STATUS_CODE,
                        ETHNIC_GROUP_CODE,
                        NATIONALITY_CODE,                            
                            (CASE INMATE_SEX 
                            WHEN 'M' THEN 'Male' 
                            WHEN 'F' THEN 'FEMALE' 
                            ELSE '' 
                            END
                            ) INMATE_SEX
                 FROM IIS.LOSS_OF_LIBERTY 
                 WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER;`;

    return new Promise((resolve, reject) => {
        db.getTuple(sql, params, resolveWithFormattedRow(resolve, 'summary'), reject);
    });
};

exports.getMovements = function(obj) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
    ];

    const sql = `SELECT DATE_OF_MOVE, MOVEMENT_CODE, TYPE_OF_MOVE,
                    (SELECT ESTABLISHMENT_NAME
                     FROM IIS.ESTABLISHMENT
                     WHERE PK_ESTABLISHMENT_CODE = SUBSTRING(ESTAB_COMP_OF_MOVE,1,2)
                    ) ESTAB_COMP_OF_MOVE
                 FROM IIS.INMATE_MOVEMENT
                 WHERE FK_PRISON_NUMBER = @FK_PRISON_NUMBER
                 ORDER BY DATE_OF_MOVE DESC, TIME_OF_MOVE DESC;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'movement'), reject);
    });
};

exports.getAliases = function(obj) {
    const params = [
        {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
    ];

    const sql = `SELECT DISTINCT
                            k.PERSON_SURNAME,
                            k.PERSON_FORENAME_1,
                            k.PERSON_FORENAME_2,
                            k.PERSON_BIRTH_DATE
                    FROM
                            IIS.LOSS_OF_LIBERTY l
                    LEFT JOIN
                            IIS.KNOWN_AS k 
                    ON
                            l.FK_PERSON_IDENTIFIER = k.FK_PERSON_IDENTIFIER
                    WHERE
                            l.PK_PRISON_NUMBER = @PK_PRISON_NUMBER
                    AND (
                        NOT
                                l.INMATE_SURNAME = k.PERSON_SURNAME
                        OR NOT
                                l.INMATE_FORENAME_1 = k.PERSON_FORENAME_1
                        OR NOT
                                l.INMATE_FORENAME_2 = k.PERSON_FORENAME_2
                    )`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'alias'), reject);
    });
};

exports.getAddresses = function(obj) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
    ];

    const sql = `SELECT INMATE_ADDRESS_1, INMATE_ADDRESS_2, INMATE_ADDRESS_4, ADDRESS_TYPE, PERSON_DETS
               FROM IIS.INMATE_ADDRESS
               WHERE FK_PRISON_NUMBER = @FK_PRISON_NUMBER;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'address'), reject);
    });

};

exports.getOffences = function(obj) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
    ];

    const sql = `SELECT o.IIS_OFFENCE_CODE, c.CASE_DATE, c.CASE_ESTAB_COMP_CODE,
                    (SELECT ESTABLISHMENT_NAME
                     FROM IIS.ESTABLISHMENT
                     WHERE PK_ESTABLISHMENT_CODE = SUBSTRING(c.CASE_ESTAB_COMP_CODE,1,2)
                    ) ESTABLISHMENT
                FROM IIS.CASE_OFFENCE o, IIS.INMATE_CASE c
                WHERE c.PKTS_INMATE_CASE = o.FK_CASE
                AND c.FK_PRISON_NUMBER = @FK_PRISON_NUMBER;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'offences'), reject);
    });
};

exports.getHDCInfo = function(obj) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
    ];

    const sql = `SELECT STAGE_DATE, STAGE, HDC_STATUS,
                    (SELECT REASON
                     FROM IIS.HDC_REASON r
                     WHERE r.FK_HDC_HISTORY = h.PKTS_HDC_HISTORY
                    ) HDC_REASON
               FROM IIS.HDC_HISTORY h
               WHERE FK_PRISON_NUMBER = @FK_PRISON_NUMBER
               ORDER BY STAGE_DATE DESC;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'hdcInfo'), reject);
    });
};

exports.getHDCRecall = function(obj) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: obj.prisonNumber}
    ];

    const sql = `SELECT RECALL_DATE_CREATED, RECALL_OUTCOME, RECALL_OUTCOME_DATE
               FROM IIS.HDC_RECALL
               WHERE FK_PRISON_NUMBER = @FK_PRISON_NUMBER
               ORDER BY HDC_RECALL_NUMBER ASC;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'hdcRecall'), reject);
    });
};

const resolveWithFormattedRow = (resolve, type) => (rows) => {
    const formatType = {
        info: formatInfoRow,
        summary: formatSummaryRow,
        movement: formatMovementRows,
        alias: formatAliasRows,
        address: formatAddressRows,
        offences: formatOffenceRows,
        hdcInfo: formatHdcInfoRows,
        hdcRecall: formatHdcRecallRows
    };

    if(Array.isArray(rows)) {
        return resolve(rows.map(formatType[type]));
    }
    if(rows === 0) {
        return resolve([]);
    }
    return resolve(formatType[type](rows));
};

function formatInfoRow(dbRow) {
    const info = {
        prisonNumber: dbRow.PK_PRISON_NUMBER.value,
        personIdentifier: dbRow.FK_PERSON_IDENTIFIER.value,
        surname: dbRow.INMATE_SURNAME.value,
        forename: dbRow.INMATE_FORENAME_1.value,
        forename2: dbRow.INMATE_FORENAME_2.value,
        pnc: dbRow.PNC.value,
        cro: dbRow.CRO.value,
        paroleRefList: dbRow.PAROLE_REF_LIST.value
    };
    logger.debug('Subject info result', info);
    return info;
}

function formatSummaryRow(dbRow) {
    return {
        dob: dbRow.DOB.value ? utils.getFormattedDateFromString(dbRow.DOB.value) : 'Unknown',
        countryOfBirth: changeCase.titleCase(describeCode('BIRTH_COUNTRY', dbRow.BIRTH_COUNTRY_CODE.value)),
        maritalStatus: changeCase.titleCase(describeCode('MARITAL_STATUS', dbRow.MARITAL_STATUS_CODE.value)),
        ethnicity: changeCase.titleCase(describeCode('ETHNIC_GROUP', dbRow.ETHNIC_GROUP_CODE.value)),
        nationality: changeCase.titleCase(describeCode('NATIONALITY', dbRow.NATIONALITY_CODE.value)),
        sex: dbRow.INMATE_SEX.value ? changeCase.sentenceCase(dbRow.INMATE_SEX.value) : 'Unknown'
    };
}

function formatMovementRows(dbRow) {
    return {
        establishment: dbRow.ESTAB_COMP_OF_MOVE.value ? changeCase.titleCase(dbRow.ESTAB_COMP_OF_MOVE.value) :
         'Establishment unknown',
        date: utils.getFormattedDateFromString(dbRow.DATE_OF_MOVE.value),
        type: dbRow.TYPE_OF_MOVE.value,
        status: dbRow.TYPE_OF_MOVE.value && dbRow.MOVEMENT_CODE.value ? formatMovementCode(dbRow) : 'Status unknown'

    };
}

function formatMovementCode(dbRow) {
    const status = dbRow.TYPE_OF_MOVE.value === 'R' ?
        describeCode('MOVEMENT_RETURN', dbRow.MOVEMENT_CODE.value.trim())
        : describeCode('MOVEMENT_DISCHARGE', dbRow.MOVEMENT_CODE.value.trim());

    return utils.acronymsToUpperCase(changeCase.sentenceCase(status));
}

function formatAliasRows(dbRow) {
    return {
        surname: dbRow.PERSON_SURNAME.value ? changeCase.titleCase(dbRow.PERSON_SURNAME.value) : '',
        forename: dbRow.PERSON_FORENAME_1.value ? changeCase.titleCase(dbRow.PERSON_FORENAME_1.value) : '',
        forename2: dbRow.PERSON_FORENAME_2.value ? changeCase.titleCase(dbRow.PERSON_FORENAME_2.value) : '',
        dob: dbRow.PERSON_BIRTH_DATE.value ? utils.getFormattedDateFromString(dbRow.PERSON_BIRTH_DATE.value) : ''
    };
}

function formatAddressRows(dbRow) {
    return {
        addressLine1: dbRow.INMATE_ADDRESS_1.value ? changeCase.titleCase(dbRow.INMATE_ADDRESS_1.value) : '',
        addressLine2: dbRow.INMATE_ADDRESS_2.value ? changeCase.titleCase(dbRow.INMATE_ADDRESS_2.value) : '',
        addressLine4: dbRow.INMATE_ADDRESS_4.value ? changeCase.titleCase(dbRow.INMATE_ADDRESS_4.value) : '',
        type: dbRow.ADDRESS_TYPE.value ? changeCase.titleCase(describeCode('ADDRESS', dbRow.ADDRESS_TYPE.value)) :
        'Unknown',
        name: dbRow.PERSON_DETS.value ? changeCase.titleCase(dbRow.PERSON_DETS.value) : ''
    };
}

function formatOffenceRows(dbRow) {
    return {
        offenceCode: dbRow.IIS_OFFENCE_CODE.value ? dbRow.IIS_OFFENCE_CODE.value : 'Unknown offence code',
        caseDate: dbRow.CASE_DATE.value ? utils.getFormattedDateFromString(dbRow.CASE_DATE.value) : 'Unknown case date',
        establishment_code: dbRow.CASE_ESTAB_COMP_CODE.value ? changeCase.upperCase(dbRow.CASE_ESTAB_COMP_CODE.value)
        : 'Unknown establishment',
        establishment: dbRow.ESTABLISHMENT.value ? changeCase.titleCase(dbRow.ESTABLISHMENT.value) :
        'Unknown establishment'
    };
}

function formatHdcInfoRows(dbRow) {
    return {
        date: dbRow.STAGE_DATE.value ? utils.getFormattedDateFromString(dbRow.STAGE_DATE.value.trim()) : 'Date unknown',
        stage: dbRow.STAGE.value ? sentenceCaseWithAcronyms('HDC_STAGE', dbRow.STAGE.value) : 'Stage unknown',
        status: dbRow.HDC_STATUS.value ? sentenceCaseWithAcronyms('HDC_STATUS', dbRow.HDC_STATUS.value) :
        'Status unknown',
        reason: dbRow.HDC_REASON.value ? sentenceCaseWithAcronyms('HDC_REASON', dbRow.HDC_REASON.value) : ''
    };
}

function sentenceCaseWithAcronyms(codeset, code) {
    return utils.acronymsToUpperCase(changeCase.sentenceCase(describeCode(codeset, code)));
}

// function titleCaseWithAcronyms(codeset, code) {
//     return utils.acronymsToUpperCase(changeCase.titleCase(describeCode(codeset, code)));
// }

function formatHdcRecallRows(dbRow) {
    return {
        date: utils.getFormattedDateFromString(dbRow.RECALL_DATE_CREATED.value),
        outcome: dbRow.RECALL_OUTCOME.value,
        outcomeDate: utils.getFormattedDateFromString(dbRow.RECALL_OUTCOME_DATE.value)
    };
}
