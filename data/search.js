'use strict';

const db = require('../server/iisData');
const utils = require('./utils');
const Case = require('case');
const moment = require('moment');

const utils = require('./utils');
const db = require('../server/db');
const resultsPerPage = require('../server/config').searchResultsPerPage;

const TYPES = require('tedious').TYPES;
const SELECT = `PK_PRISON_NUMBER, 
                INMATE_SURNAME, 
                INMATE_FORENAME_1, 
                INMATE_FORENAME_2,
                INMATE_BIRTH_DATE DOB,
                DATE_1ST_RECEP,
                SUBSTRING(
                    (SELECT ', ' + k.PERSON_FORENAME_1 + ' ' + PERSON_FORENAME_2 + ' ' + k.PERSON_SURNAME 
                     FROM IIS.KNOWN_AS k 
                     WHERE k.FK_PERSON_IDENTIFIER=l.FK_PERSON_IDENTIFIER FOR XML PATH('')),2,200000
                ) 
                ALIAS,
                (SELECT TOP 1 CONCAT('{\"court\":\"',(SELECT TMPU_COURT_NAME 
                                                      FROM IIS.TMPU_COURT 
                                                      WHERE PK_TMPU_COURT_CODE = c.IIS_COURT_CODE), 
                                                      '\", \"date\":\"', HEARING_DATE, '\"}')
                             
                    FROM IIS.COURT_HEARING c 
                    WHERE c.COURT_TYPE_CODE='SC' 
                    AND c.FK_CASE IN (SELECT PKTS_INMATE_CASE 
                                      FROM IIS.INMATE_CASE 
                                      WHERE CASE_STATUS_CODE 
                                      LIKE 'SENT%' 
                                      AND FK_PRISON_NUMBER=l.PK_PRISON_NUMBER) 
                                      ORDER BY HEARING_DATE DESC) SENTENCING_COURT`;
const TABLE = 'IIS.LOSS_OF_LIBERTY l';
const ORDER_BY = 'INMATE_SURNAME, SUBSTRING(INMATE_FORENAME_1, 1, 1), DOB, DATE_1ST_RECEP DESC';

const getSearchOperatorSql = {
    prisonNumber: getPrisonNumberSqlWithParams,
    pncNumber: getPncNumberSqlWithParams,
    croNumber: getCroNumberSqlWithParams,
    forename: getStringSqlWithParams('INMATE_FORENAME_1', {wildcardEnabled: true}),
    forename2: getStringSqlWithParams('INMATE_FORENAME_2', {wildcardEnabled: true}),
    surname: getStringSqlWithParams('INMATE_SURNAME', {wildcardEnabled: true}),
    dobDay: getDobSqlWithParams,
    age: getAgeSqlWithParams
};

exports.inmate = function(userInput) {
    return new Promise((resolve, reject) => {
        const obj = getParamsForUserInput(userInput);
        const resultLimits = getPaginationLimits(userInput.page);
        const sql = prepareSqlStatement(SELECT, TABLE, obj.where, ORDER_BY, resultLimits);

        db.getCollection(sql, obj.params, resolveWithFormattedData(resolve), reject);
    });
};

const resolveWithFormattedData = (resolve) => (dbRows) => resolve(dbRows.map(formatRow));

exports.totalRowsForUserInput = function(userInput) {
    return new Promise((resolve, reject) => {
        let obj = getParamsForUserInput(userInput);
        let sql = prepareSqlStatement('COUNT(*) AS totalRows', 'IIS.LOSS_OF_LIBERTY', obj.where);

        db.getTuple(sql, obj.params, resolve, reject);
    });
};

function getPrisonNumberSqlWithParams(obj) {
    obj.val = utils.padPrisonNumber(obj.val);
    return getStringSqlWithParams('PK_PRISON_NUMBER')(obj);
}

function getPncNumberSqlWithParams(obj) {
    let sql = `FK_PERSON_IDENTIFIER IN 
                (SELECT FK_PERSON_IDENTIFIER 
                FROM iis.IIS_IDENTIFIER
                WHERE iis.IIS_IDENTIFIER.PERSON_IDENT_TYPE_CODE = 'PNC' 
                AND iis.IIS_IDENTIFIER.PERSON_IDENTIFIER_VALUE = @PNC)`;

    return {
        sql: sql,
        params: [
            {column: 'PNC', type: getType('string'), value: obj.userInput.pncNumber}
        ]
    };
}

function getCroNumberSqlWithParams(obj) {
    let sql = `FK_PERSON_IDENTIFIER IN 
                (SELECT FK_PERSON_IDENTIFIER 
                FROM iis.IIS_IDENTIFIER 
                WHERE iis.IIS_IDENTIFIER.PERSON_IDENT_TYPE_CODE = 'CRO' 
                AND iis.IIS_IDENTIFIER.PERSON_IDENTIFIER_VALUE = @CRO)`;

    return {
        sql: sql,
        params: [
            {column: 'CRO', type: getType('string'), value: obj.userInput.croNumber}
        ]
    };
}

function getStringSqlWithParams(dbColumn, options) {
    const operator = options && options.wildcardEnabled ? 'LIKE' : '=';
    return (obj) => {
        return {
            sql: `${dbColumn} ${operator} @${dbColumn}`,
            params: [{
                column: dbColumn,
                type: getType('string'),
                value: obj.val
            }]
        };
    };
}

function getDobSqlWithParams(obj) {
    if (obj.userInput.dobOrAge !== 'dob') {
        return null;
    }

    obj.val = obj.userInput.dobYear +
        utils.pad(obj.userInput.dobMonth) +
        utils.pad(obj.userInput.dobDay);

    return getStringSqlWithParams('INMATE_BIRTH_DATE', false)(obj);
}

function getAgeSqlWithParams(obj) {
    if (obj.userInput.dobOrAge !== 'age') {
        return null;
    }

    let dateRange = utils.getDateRange(obj.userInput.age);

    let sql = '(INMATE_BIRTH_DATE >= @from_date AND INMATE_BIRTH_DATE <= @to_date)';
    return {
        sql: sql,
        params: [
            {column: 'from_date', type: getType('string'), value: dateRange[0]},
            {column: 'to_date', type: getType('string'), value: dateRange[1]}
        ]
    };
}

function getType(v) {
    // default type
    return TYPES.VarChar;
}

function getPaginationLimits(pageOn) {
    return {
        start: (resultsPerPage * pageOn) - resultsPerPage,
        resultsPerPage
    };
}

function getParamsForUserInput(userInput) {
    return Object.keys(userInput).reduce((allParams, key) => {
        const val = userInput[key];
        if (!val || !getSearchOperatorSql[key]) {
            return allParams;
        }

        const objectParams = getSearchOperatorSql[key]({val, userInput});
        if (!objectParams) {
            return allParams;
        }

        allParams.params = allParams.params.concat(objectParams.params);
        allParams.where = (allParams.where) ? `${allParams.where} AND ${objectParams.sql}` : objectParams.sql;
        return allParams;

    }, {where: '', params: []});
}

function prepareSqlStatement(fields, from, where, orderBy, limit ) {
    let sql = 'SELECT';
    sql += ' ' + fields;
    sql += ' FROM ' + from;
    sql += where ? ' WHERE ' + where : '';
    sql += orderBy ? ' ORDER BY ' + orderBy : '';
    sql += limit ? ' OFFSET ' + limit.start + ' ROWS FETCH NEXT ' + limit.resultsPerPage + ' ROWS ONLY' : '';

    return sql;
}

function formatRow(dbRow) {

    let sentencingCourt = null;
    let sentencingDate = null;

    if(dbRow.SENTENCING_COURT.value) {
        let sentencing = JSON.parse(dbRow.SENTENCING_COURT.value);
        sentencingCourt = sentencing.court;
        sentencingDate = moment(sentencing.date, 'YYYYMMDD').format('MMM YYYY');
    }

    return {
        prisonNumber: dbRow.PK_PRISON_NUMBER.value,
        surname: dbRow.INMATE_SURNAME.value ? Case.upper(dbRow.INMATE_SURNAME.value) : '',
        forename: dbRow.INMATE_FORENAME_1.value ? Case.title(dbRow.INMATE_FORENAME_1.value) : '',
        forename2: dbRow.INMATE_FORENAME_2.value ? Case.capital(dbRow.INMATE_FORENAME_2.value) : '',
        dob: utils.getFormattedDateFromString(dbRow.DOB.value),
        alias: dbRow.ALIAS.value,
        sentencingCourt: sentencingCourt,
        sentencingDate: sentencingDate,
        firstReceptionDate: utils.getFormattedDateFromString(dbRow.DATE_1ST_RECEP.value)
    };
}
