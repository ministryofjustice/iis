'use strict';

const db = require('../server/iisData');
const resultsPerPage = require('../server/config').searchResultsPerPage;
const TYPES = require('tedious').TYPES;

const getSearchOperatorSql = {
    prisonNumber: getStringSqlWithParams('PRISON_NUMBER'),
    pncNumber: getStringSqlWithParams('PNC_NUMBER'),
    croNumber: getStringSqlWithParams('CRO_NUMBER'),
    forename: getStringSqlWithParams('FORENAME_1', {wildcardEnabled: true}),
    forename2: getStringSqlWithParams('FORENAME_2', {wildcardEnabled: true}),
    surname: getStringSqlWithParams('SURNAME', {wildcardEnabled: true}),
    dobDay: getStringSqlWithParams('BIRTH_DATE'),
    age: getStringSqlWithParams('AGE'),
    gender: getGenderSqlWithParams,
    hasHDC: getFilterSql('HAS_HDC'),
    isLifer: getFilterSql('IS_LIFER')
};

exports.getSearchResultsCount = function(userInput) {
    return new Promise((resolve, reject) => {
        let obj = getParamsForUserInput(userInput);

        let sql = `SELECT COUNT(*) As totalRows
                    FROM (
                           SELECT
                             row_number()
                             OVER ( PARTITION BY PRISON_NUMBER
                               ORDER BY (IS_ALIAS) ) ROW_NUM,
                             *
                           FROM HPA.PRISONERS
                           WHERE ${obj.where}
                         ) NUMBERED_ROWS
                    WHERE ROW_NUM = 1`;

        db.getTuple(sql, obj.params, resolve, reject);
    });
};

exports.getSearchResults = function(userInput) {
    return new Promise((resolve, reject) => {
        const obj = getParamsForUserInput(userInput);
        const resultLimits = getPaginationLimits(userInput.page);
        const sql = `SELECT PRISON_NUMBER, SUMMARY
                     FROM (
                            SELECT
                              row_number()
                              OVER ( PARTITION BY PRISON_NUMBER
                                ORDER BY (IS_ALIAS) ) ROW_NUM,
                              *
                            FROM HPA.PRISONERS
                            WHERE ${obj.where}
                          ) NUMBERED_ROWS
                     WHERE ROW_NUM = 1
                     ORDER BY IS_ALIAS, PRIMARY_SURNAME, PRIMARY_INITIAL, BIRTH_DATE, RECEPTION_DATE DESC
                     OFFSET ${resultLimits.start} ROWS
                     FETCH NEXT ${resultLimits.resultsPerPage} ROWS ONLY`;

        db.getCollection(sql, obj.params, parseSearchResult(resolve), reject);
    });
};

const parseSearchResult = resolve => results => resolve(results.map(item => JSON.parse(item.SUMMARY.value)));

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

function getStringSqlWithParams(dbColumn, options = {}) {
    const {wildcardEnabled} = options;

    return obj => {

        const operator = wildcardEnabled && obj.val.includes('%') ? 'LIKE' : '=';

        return {
            sql: `${dbColumn} ${operator} @${dbColumn}`,
            params: [{
                column: dbColumn,
                type: TYPES.VarChar,
                value: obj.val
            }]
        };
    };
}

function getGenderSqlWithParams(obj) {
    const genders = obj.userInput.gender;
    const genderLength = genders.length;

    return genders.reduce((obj, gender, index) => {
        const lastParam = index === genderLength - 1;
        const newParam = {column: `gender${index}`, type: TYPES.VarChar, value: gender};
        const newSql = index === 0 ? obj.sql : obj.sql.concat(` OR SEX = @gender${index}`);

        return {
            params: [...obj.params, newParam],
            sql: lastParam ? newSql.concat(')') : newSql
        };

    }, {params: [], sql: '(SEX = @gender0'});
}

function getFilterSql(column) {
    return () => {
        return {
            sql: `${column} = 'TRUE'`,
            params: []
        };
    };
}
