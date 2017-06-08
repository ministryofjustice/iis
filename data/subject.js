'use strict';

const Case = require('case');
const TYPES = require('tedious').TYPES;

const db = require('../server/iisData');
const {describeCode} = require('../data/codes');
const utils = require('../data/utils');
const logger = require('../log');

exports.getSubject = function(prisonNumber) {

    logger.debug('Subject info search');
    const params = [
        {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    let sql = `SELECT 
                        PK_PRISON_NUMBER, 
                        INMATE_SURNAME, 
                        INMATE_FORENAME_1, 
                        INMATE_FORENAME_2,
                        INMATE_BIRTH_DATE DOB, 
                        FK_PERSON_IDENTIFIER,
                        BIRTH_COUNTRY_CODE,
                        MARITAL_STATUS_CODE,
                        ETHNIC_GROUP_CODE,
                        NATIONALITY_CODE,
                        RELIGION_CODE,
                        (
                            CASE INMATE_SEX 
                                WHEN 'M' THEN 'Male' 
                                WHEN 'F' THEN 'FEMALE' 
                                ELSE '' 
                            END
                        ) INMATE_SEX,
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
                            SELECT
                                TOP 1 PERSON_IDENTIFIER_VALUE
                            FROM 
                                IIS.IIS_IDENTIFIER
                            WHERE 
                                PERSON_IDENT_TYPE_CODE = 'CRO'
                            AND 
                                FK_PERSON_IDENTIFIER=LOSS_OF_LIBERTY.FK_PERSON_IDENTIFIER
                        ) CRO,
                        (
                            STUFF
                            (
                                (
                                    SELECT
                                        DISTINCT ', ' + CAST(PAROLE_REF_NUMBER AS VARCHAR(7))
                                    FROM
                                        IIS.PAROLE_REVIEW
                                    WHERE
                                        FK_PRISON_NUMBER = @PK_PRISON_NUMBER
                                    FOR XML PATH('')
                                ), 1, 1, ''
                            )
                        ) PAROLE_REF_LIST
                    FROM
                        IIS.LOSS_OF_LIBERTY 
                    WHERE
                        PK_PRISON_NUMBER = @PK_PRISON_NUMBER;`;

    logger.debug('Subject info search', sql);

    return new Promise((resolve, reject) => {
        db.getTuple(sql, params, resolveWithFormattedRow(resolve, 'subject'), reject);
    });
};

exports.getMovements = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    const sql = `SELECT
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
                        ) ESTAB_COMP_OF_MOVE
                 FROM
                    IIS.INMATE_MOVEMENT
                 WHERE
                    FK_PRISON_NUMBER = @FK_PRISON_NUMBER
                 ORDER BY
                    DATE_OF_MOVE DESC, TIME_OF_MOVE DESC;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'movement'), reject);
    });
};

exports.getAliases = function(prisonNumber) {
    const params = [
        {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
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

exports.getAddresses = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    const sql = `SELECT
                        INMATE_ADDRESS_1, 
                        INMATE_ADDRESS_2, 
                        INMATE_ADDRESS_4, 
                        ADDRESS_TYPE, 
                        PERSON_DETS
                FROM 
                    IIS.INMATE_ADDRESS
                WHERE
                    FK_PRISON_NUMBER = @FK_PRISON_NUMBER;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'address'), reject);
    });

};

exports.getOffences = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    const sql = `SELECT 
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
                    IIS.CASE_OFFENCE o, IIS.INMATE_CASE c
                WHERE
                    c.PKTS_INMATE_CASE = o.FK_CASE
                AND 
                    c.FK_PRISON_NUMBER = @FK_PRISON_NUMBER;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'offences'), reject);
    });
};

exports.getHDCInfo = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    const sql = `SELECT 
                    STAGE_DATE,
                    STAGE, 
                    HDC_STATUS,
                    (
                        SELECT
                            REASON AS code
                        FROM
                            IIS.HDC_REASON r
                        WHERE
                            r.FK_HDC_HISTORY = h.PKTS_HDC_HISTORY
                    FOR JSON AUTO) HDC_REASON
                FROM 
                    IIS.HDC_HISTORY h
                WHERE
                    FK_PRISON_NUMBER = @FK_PRISON_NUMBER
                ORDER BY
                    STAGE_DATE DESC;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'hdcInfo'), reject);
    });
};

exports.getHDCRecall = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    const sql = `SELECT
                    RECALL_DATE_CREATED, 
                    RECALL_OUTCOME, 
                    RECALL_OUTCOME_DATE
                FROM 
                    IIS.HDC_RECALL
                WHERE 
                    FK_PRISON_NUMBER = @FK_PRISON_NUMBER
                ORDER BY 
                    HDC_RECALL_NUMBER ASC;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'hdcRecall'), reject);
    });
};

exports.getAdjudications = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    const sql = `SELECT
                        ADJ_CHARGE,
                        DATE_OF_FINDING,
                        OUTCOME_OF_HEARING,
                        (
                            SELECT
                                ESTABLISHMENT_NAME 
                            FROM
                                IIS.ESTABLISHMENT
                            WHERE
                                PK_ESTABLISHMENT_CODE = SUBSTRING(o.OFFENCE_ESTAB_COMP_CODE,1,2)
                        ) ESTABLISHMENT                   
                 FROM
                    IIS.ADJ_OFFENCE o
                 WHERE 
                    FK_PRISON_NUMBER = @FK_PRISON_NUMBER;`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'adjudications'), reject);
    });
};

exports.getCourtHearings = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    let sql = `SELECT DISTINCT
                    HEARING_DATE,
                    (
                        SELECT 
                            CODE_DESCRIPTION
                        FROM 
                            IIS.IIS_CODE
                        WHERE 
                            PK_CODE_TYPE=42
                        AND 
                            PK_CODE_REF_NUM=IIS_COURT_CODE
                    ) COURT_NAME                    
                FROM 
                    IIS.COURT_HEARING
                WHERE
                    FK_CASE IN
                    (
                        SELECT 
                            PKTS_INMATE_CASE
                        FROM
                            IIS.INMATE_CASE
                        WHERE
                            FK_PRISON_NUMBER = @FK_PRISON_NUMBER
                    )
                AND
                    COURT_TYPE_CODE = 'SC'
                ORDER BY
                    HEARING_DATE DESC`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'courtHearing'), reject);
    });
};

exports.getSentenceHistory = function(prisonNumber) {
    const params = [
        {column: 'FK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    let sql = ` SELECT *
                FROM 
                    IIS.EFF_SEN_HIST
                WHERE 
                    FK_STATE_CHANGE IN
                    (
                        SELECT 
                            PKTS_STATE_CHANGE
                        FROM
                            IIS.STATE_CHANGE
                        WHERE 
                            FK_PRISON_NUMBER = @FK_PRISON_NUMBER
                        AND 
                            (STATE_VALUE = '03' OR STATE_VALUE = '06')
                    )
                ORDER BY
                    SENTENCE_CHANGE_DATE DESC`;

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveWithFormattedRow(resolve, 'sentenceHistory'), reject);
    });
};

const resolveWithFormattedRow = (resolve, type) => rows => {
    const formatType = {
        subject: formatSubjectRow,
        courtHearing: formatCourtHearingRow,
        sentenceHistory: formatSentenceHistoryRow,
        movement: formatMovementRow,
        alias: formatAliasRow,
        address: formatAddressRow,
        offences: formatOffenceRow,
        hdcInfo: formatHdcInfoRow,
        hdcRecall: formatHdcRecallRow,
        adjudications: formatAdjudicationRow
    };

    if (Array.isArray(rows)) {
        return resolve(rows.map(formatType[type]));
    }
    if (rows === 0) {
        return resolve([]);
    }
    return resolve(formatType[type](rows));
};

function formatSubjectRow(dbRow) {
    const info = {
        prisonNumber: dbRow.PK_PRISON_NUMBER.value,
        personIdentifier: dbRow.FK_PERSON_IDENTIFIER.value,
        surname: dbRow.INMATE_SURNAME.value ? Case.upper(dbRow.INMATE_SURNAME.value) : '',
        forename: dbRow.INMATE_FORENAME_1.value ? Case.title(dbRow.INMATE_FORENAME_1.value) : '',
        forename2: dbRow.INMATE_FORENAME_2.value ? Case.capital(dbRow.INMATE_FORENAME_2.value) : '',
        pnc: dbRow.PNC.value,
        cro: dbRow.CRO.value,
        paroleRefList: dbRow.PAROLE_REF_LIST.value,
        dob: dbRow.DOB.value ? utils.getFormattedDateFromString(dbRow.DOB.value) : 'Unknown',
        countryOfBirth: Case.title(describeCode('BIRTH_COUNTRY', dbRow.BIRTH_COUNTRY_CODE.value)),
        maritalStatus: Case.title(describeCode('MARITAL_STATUS', dbRow.MARITAL_STATUS_CODE.value)),
        ethnicity: Case.title(describeCode('ETHNIC_GROUP', dbRow.ETHNIC_GROUP_CODE.value)),
        nationality: Case.title(describeCode('NATIONALITY', dbRow.NATIONALITY_CODE.value)),
        religion: Case.title(describeCode('RELIGION', dbRow.RELIGION_CODE.value)),
        sex: dbRow.INMATE_SEX.value ? Case.sentence(dbRow.INMATE_SEX.value) : 'Unknown'
    };
    if (info.dob && info.dob !== 'Unknown') {
        info.age = utils.getAgeFromDOB(info.dob);
    }
    logger.debug('Subject info result', info);
    return info;
}

function formatMovementRow(dbRow) {
    return {
        establishment: dbRow.ESTAB_COMP_OF_MOVE.value ? Case.title(dbRow.ESTAB_COMP_OF_MOVE.value) :
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

    return sentenceCaseWithAcronyms(status);
}

function formatAliasRow(dbRow) {
    return {
        surname: dbRow.PERSON_SURNAME.value ? Case.title(dbRow.PERSON_SURNAME.value).trim() : '',
        forename: dbRow.PERSON_FORENAME_1.value ? Case.title(dbRow.PERSON_FORENAME_1.value).trim() : '',
        forename2: dbRow.PERSON_FORENAME_2.value ? Case.title(dbRow.PERSON_FORENAME_2.value).trim() : '',
        dob: dbRow.PERSON_BIRTH_DATE.value ? utils.getFormattedDateFromString(dbRow.PERSON_BIRTH_DATE.value) : 'Unknown'
    };
}

function formatAddressRow(dbRow) {
    return {
        addressLine1: dbRow.INMATE_ADDRESS_1.value ? Case.title(dbRow.INMATE_ADDRESS_1.value.trim()) : '',
        addressLine2: dbRow.INMATE_ADDRESS_2.value ? Case.title(dbRow.INMATE_ADDRESS_2.value) : '',
        addressLine4: dbRow.INMATE_ADDRESS_4.value ? Case.title(dbRow.INMATE_ADDRESS_4.value) : '',
        type: dbRow.ADDRESS_TYPE.value ? Case.title(describeCode('ADDRESS', dbRow.ADDRESS_TYPE.value)) :
            'Unknown',
        name: dbRow.PERSON_DETS.value ? Case.title(dbRow.PERSON_DETS.value) : ''
    };
}

function formatOffenceRow(dbRow) {
    return {
        offenceCode: dbRow.IIS_OFFENCE_CODE.value ? dbRow.IIS_OFFENCE_CODE.value : 'Unknown offence code',
        caseDate: dbRow.CASE_DATE.value ? utils.getFormattedDateFromString(dbRow.CASE_DATE.value) : 'Unknown case date',
        establishment_code: dbRow.CASE_ESTAB_COMP_CODE.value ? Case.upper(dbRow.CASE_ESTAB_COMP_CODE.value)
            : 'Unknown establishment',
        establishment: dbRow.ESTABLISHMENT.value ? Case.title(dbRow.ESTABLISHMENT.value) :
            'Unknown establishment'
    };
}

function formatHdcInfoRow(dbRow) {
    return {
        date: dbRow.STAGE_DATE.value ? utils.getFormattedDateFromString(dbRow.STAGE_DATE.value.trim()) : 'Date unknown',
        stage: dbRow.STAGE.value ? sentenceCaseWithAcronymsForCode('HDC_STAGE', dbRow.STAGE.value) : 'Stage unknown',
        status: dbRow.HDC_STATUS.value ? sentenceCaseWithAcronymsForCode('HDC_STATUS', dbRow.HDC_STATUS.value) :
            'Status unknown',
        reason: dbRow.HDC_REASON.value ? formatHdcReasonCodes(dbRow.HDC_REASON.value) : ''
    };
}

function formatHdcReasonCodes(reasonCodes) {

    let reasonCodesJson = JSON.parse(reasonCodes);

    return reasonCodesJson
        .map(reasonCode => {
            return sentenceCaseWithAcronymsForCode('HDC_REASON', reasonCode.code);
        }).filter((reasonDescription, index, inputArray) => {
            return inputArray.indexOf(reasonDescription) === index;
        }).join(', ');
}

function sentenceCaseWithAcronymsForCode(codeset, code) {
    return utils.acronymsToUpperCase(Case.sentence(describeCode(codeset, code)));
}

function sentenceCaseWithAcronyms(text) {
    return utils.acronymsToUpperCase(Case.sentence(text));
}

function formatHdcRecallRow(dbRow) {
    return {
        date: utils.getFormattedDateFromString(dbRow.RECALL_DATE_CREATED.value),
        outcome: dbRow.RECALL_OUTCOME.value,
        outcomeDate: utils.getFormattedDateFromString(dbRow.RECALL_OUTCOME_DATE.value)
    };
}

function formatAdjudicationRow(dbRow) {
    return {
        establishment: dbRow.ESTABLISHMENT.value ?
            Case.title(dbRow.ESTABLISHMENT.value) : 'Establishment unknown',

        charge: dbRow.ADJ_CHARGE.value ?
            sentenceCaseWithAcronymsForCode('ADJUDICATION_CHARGE', dbRow.ADJ_CHARGE.value) : 'Unknown',

        outcome: dbRow.OUTCOME_OF_HEARING.value ?
            Case.sentence(describeCode('ADJUDICATION_OUTCOME', dbRow.OUTCOME_OF_HEARING.value)) : 'Unknown',

        date: utils.getFormattedDateFromString(dbRow.DATE_OF_FINDING.value)
    };
}

function formatCourtHearingRow(dbRow) {
    return {
        date: utils.getFormattedDateFromString(dbRow.HEARING_DATE.value),
        court: dbRow.COURT_NAME.value ? Case.title(dbRow.COURT_NAME.value) : ''
    };
}

function formatSentenceHistoryRow(dbRow) {
    return {
        changeDate: utils.getFormattedDateFromString(dbRow.SENTENCE_CHANGE_DATE.value),
        reasonCode: dbRow.REASON_SENT_DET_CHANGE.value ?
            sentenceCaseWithAcronyms(dbRow.REASON_SENT_DET_CHANGE.value) : '',
        keyDates: getKeyDates(dbRow),
        length: dbRow.EFFECTIVE_SENTENCE_LENGTH.value ? dbRow.EFFECTIVE_SENTENCE_LENGTH.value : ''
    };
}

function getKeyDates(dbRow) {

    let keyDates = {};

    addNonEmptyDate(keyDates, 'SED', dbRow.SENTENCE_EXPIRY_DATE);
    addNonEmptyDate(keyDates, 'PED', dbRow.PED);
    addNonEmptyDate(keyDates, 'NPD', dbRow.NPD);
    addNonEmptyDate(keyDates, 'LED', dbRow.LED);
    addNonEmptyDate(keyDates, 'CRD', dbRow.CRD);
    addNonEmptyDate(keyDates, 'HDCAD', dbRow.HDCAD);
    addNonEmptyDate(keyDates, 'HDCED', dbRow.HDCED);

    return keyDates;
}

function addNonEmptyDate(keyDates, label, col) {
    if(col.value && col.value !== '18991231') {
        keyDates[label] = utils.getFormattedDateFromString(col.value);
    }
}


