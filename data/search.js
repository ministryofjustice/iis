'use strict';

const Case = require('case');

const utils = require('./utils');
const db = require('../server/iisData');
const resultsPerPage = require('../server/config').searchResultsPerPage;

const TYPES = require('tedious').TYPES;
const SELECT = `l.PK_PRISON_NUMBER,
                  l.DATE_1ST_RECEP,
                  l.INMATE_SURNAME,
                  l.INMATE_FORENAME_1,
                  l.INMATE_FORENAME_2,
                  l.INMATE_BIRTH_DATE DOB,
                  k.PERSON_FORENAME_1,
                  k.PERSON_FORENAME_2,
                  k.PERSON_SURNAME,
                  k.PERSON_BIRTH_DATE
                `;
const ORDER_BY = 'INMATE_SURNAME, SUBSTRING(INMATE_FORENAME_1, 1, 1), DOB, DATE_1ST_RECEP DESC';

const getSearchOperatorSql = {
    prisonNumber: getPrisonNumberSqlWithParams,
    pncNumber: getPncNumberSqlWithParams,
    croNumber: getCroNumberSqlWithParams,
    forename: getStringSqlWithParams('PERSON_FORENAME_1', {wildcardEnabled: true}),
    forename2: getStringSqlWithParams('PERSON_FORENAME_2', {wildcardEnabled: true}),
    surname: getStringSqlWithParams('PERSON_SURNAME', {wildcardEnabled: true}),
    dobDay: getDobSqlWithParams,
    age: getAgeSqlWithParams,
    gender: getGenderSqlWithParams,
    hasHDC: getHDCHistory
};

exports.inmate = function(userInput) {
    return new Promise((resolve, reject) => {
        const obj = getParamsForUserInput(userInput);
        const resultLimits = getPaginationLimits(userInput.page);
        const sql = prepareSqlStatement(SELECT, obj.where, ORDER_BY, resultLimits);

        db.getCollection(sql, obj.params, resolveWithFormattedData(resolve), reject);
    });
};

const resolveWithFormattedData = resolve => dbRows => resolve(dbRows.map(formatRow));

exports.totalRowsForUserInput = function(userInput) {
    return new Promise((resolve, reject) => {
        let obj = getParamsForUserInput(userInput);

        let sql = 'SELECT COUNT(*) AS totalRows FROM (' + prepareSqlStatement(SELECT, obj.where) + ') AS search';

        db.getTuple(sql, obj.params, resolve, reject);
    });
};

function getPrisonNumberSqlWithParams(obj) {
    obj.val = utils.padPrisonNumber(obj.val);
    return getStringSqlWithParams('PK_PRISON_NUMBER')(obj);
}

function getPncNumberSqlWithParams(obj) {
    let sql = `l.FK_PERSON_IDENTIFIER IN 
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
    let sql = `l.FK_PERSON_IDENTIFIER IN 
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
    return obj => {
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

    return getStringSqlWithParams('PERSON_BIRTH_DATE', false)(obj);
}

function getAgeSqlWithParams(obj) {
    if (obj.userInput.dobOrAge !== 'age') {
        return null;
    }

    let dateRange = utils.getDateRange(obj.userInput.age);

    let sql = '(PERSON_BIRTH_DATE >= @from_date AND PERSON_BIRTH_DATE <= @to_date)';
    return {
        sql,
        params: [
            {column: 'from_date', type: getType('string'), value: dateRange[0]},
            {column: 'to_date', type: getType('string'), value: dateRange[1]}
        ]
    };
}

function getGenderSqlWithParams(obj) {
    const genders = obj.userInput.gender;
    const genderLength = genders.length;

    return genders.reduce((obj, gender, index) => {
        const lastParam = index === genderLength - 1;
        const newParam = {column: `gender${index}`, type: getType('string'), value: gender};
        const newSql = index === 0 ? obj.sql : obj.sql.concat(` OR PERSON_SEX = @gender${index}`);

        return {
            params: [...obj.params, newParam],
            sql: lastParam ? newSql.concat(')') : newSql
        };

    }, {params: [], sql: '(PERSON_SEX = @gender0'});
}

function getHDCHistory(obj) {
    const sql = 'exists (select 1 from IIS.HDC_HISTORY WHERE FK_PRISON_NUMBER = PK_PRISON_NUMBER)';

    return {
        sql,
        params: []
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

function prepareSqlStatement(fields, where, orderBy, limit) {
    let sql = 'SELECT * FROM (SELECT row_number() OVER ( PARTITION BY PK_PRISON_NUMBER ORDER BY (SELECT 1) ) RN,';
    sql += ' ' + fields;
    sql += ' FROM IIS.KNOWN_AS k INNER JOIN IIS.LOSS_OF_LIBERTY l ON l.FK_PERSON_IDENTIFIER = K.FK_PERSON_IDENTIFIER';
    sql += where ? ' WHERE ' + where : '';
    sql += where ? ' AND ' : ' WHERE';
    sql += "NOT EXISTS (SELECT 1 FROM IIS.IIS_IDENTIFIER i WHERE i.FK_PERSON_IDENTIFIER = l.FK_PERSON_IDENTIFIER " +
     "AND PERSON_IDENT_TYPE_CODE = 'NOM')";
    sql += ' ) NUMBERED_ROWS WHERE RN = 1';
    sql += orderBy ? ' ORDER BY ' + orderBy : '';
    sql += limit ? ' OFFSET ' + limit.start + ' ROWS FETCH NEXT ' + limit.resultsPerPage + ' ROWS ONLY' : '';

    return sql;
}

function formatRow(dbRow) {
    return {
        prisonNumber: dbRow.PK_PRISON_NUMBER.value,
        surname: dbRow.INMATE_SURNAME.value ? Case.upper(dbRow.INMATE_SURNAME.value) : '',
        forename: dbRow.INMATE_FORENAME_1.value ? Case.capital(dbRow.INMATE_FORENAME_1.value) : '',
        forename2: dbRow.INMATE_FORENAME_2.value ? Case.capital(dbRow.INMATE_FORENAME_2.value) : '',
        dob: utils.getFormattedDateFromString(dbRow.DOB.value),
        firstReceptionDate: utils.getFormattedDateFromString(dbRow.DATE_1ST_RECEP.value),
        alias: aliasFor(dbRow)
    };
}

function aliasFor(dbRow) {
    let realFirst = dbRow.INMATE_FORENAME_1.value;
    let realMiddle = dbRow.INMATE_FORENAME_2.value;
    let realLast = dbRow.INMATE_SURNAME.value;
    let realDob = dbRow.DOB.value;

    let aliasFirst = dbRow.PERSON_FORENAME_1.value;
    let aliasMiddle = dbRow.PERSON_FORENAME_2.value;
    let aliasLast = dbRow.PERSON_SURNAME.value;
    let aliasDob = dbRow.PERSON_BIRTH_DATE.value;

    if (aliasFirst !== realFirst
        || aliasMiddle !== realMiddle
        || aliasLast !== realLast
        || aliasDob !== realDob) {

        let aliasName = [aliasFirst, aliasMiddle, aliasLast].filter(name => {
            return name && name.trim() !== '';
        }).map(name => {
            return Case.capital(name.trim());
        }).join(' ');

        return [aliasName, utils.getFormattedDateFromString(aliasDob)].join(', ');
    }

    return '';
}
