'use strict';

const utils = require('./utils');
const {getCollection} = require('./dataAccess/iisData');
const resultsPerPage = require('../server/config').searchResultsPerPage;
const TYPES = require('tedious').TYPES;

const distance = require('../server/config').addressSearchDistance;

const getSearchOperatorSql = {
    prisonNumber: getStringSqlWithParams('PRISON_NUMBER'),
    pncNumber: getStringSqlWithParams('PNC_NUMBER'),
    croNumber: getStringSqlWithParams('CRO_NUMBER'),
    forename: getStringSqlWithParams('FORENAME_1', {wildcardEnabled: true, wildcardInitial: true}),
    forename2: getStringSqlWithParams('FORENAME_2', {wildcardEnabled: true, wildcardInitial: true}),
    surname: getStringSqlWithParams('SURNAME', {wildcardEnabled: true}),
    dobDay: getDobSqlWithParams,
    age: getAgeSqlWithParams,
    gender: getGenderSqlWithParams,
    hasHDC: getFilterSql('HAS_HDC'),
    isLifer: getFilterSql('IS_LIFER'),
    address: getAddressSqlWithParams
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

        getCollection(sql, obj.params, resolve, reject);
    });
};

exports.getSearchResults = function(userInput) {
    return new Promise((resolve, reject) => {
        const obj = getParamsForUserInput(userInput);
        const resultLimits = getPaginationLimits(userInput.page);
        const sql = `SELECT PRISON_NUMBER      AS prisonNumber,
                            RECEPTION_DATE     AS receptionDate,
                            PRIMARY_SURNAME    AS lastName,
                            PRIMARY_FORENAME_1 AS firstName,
                            PRIMARY_FORENAME_2 AS middleName,
                            PRIMARY_BIRTH_DATE AS dob,
                            IS_ALIAS           AS isAlias,
                            SURNAME            AS aliasLast,
                            FORENAME_1         AS aliasFirst,
                            FORENAME_2         AS aliasMiddle
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

        getCollection(sql, obj.params, parseSearchResults(resolve), reject);
    });
};

const parseSearchResults = resolve => results => resolve(results.map(item => flattenedPrisonerResult(item)));

const flattenedPrisonerResult = item => Object.keys(item).reduce((newItem, attribute) => {
    return Object.assign({}, newItem, {[attribute]: item[attribute].value});
}, {});

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
    return obj => {

        const {operator, value} = getStringInput(options, obj.val);

        return {
            sql: `${dbColumn} ${operator} @${dbColumn}`,
            params: [{
                column: dbColumn,
                type: TYPES.VarChar,
                value
            }]
        };
    };
}

function getStringInput(options, value) {
    const {wildcardEnabled, wildcardInitial} = options;

    if(wildcardEnabled && value.includes('%')) {
        return {operator: 'LIKE', value};
    }

    if(wildcardInitial && value.length === 1) {
        return {operator: 'LIKE', value: value.concat('%')};
    }

    return {operator: '=', value};
}

function getDobSqlWithParams(obj) {
    obj.val = obj.userInput.dobYear + '-' +
        utils.pad(obj.userInput.dobMonth) + '-' +
        utils.pad(obj.userInput.dobDay);

    return getStringSqlWithParams('BIRTH_DATE', false)(obj);
}

function getAgeSqlWithParams(obj) {
    let dateRange = utils.getDateRange(obj.userInput.age);

    let sql = '(BIRTH_DATE >= @from_date AND BIRTH_DATE <= @to_date)';
    return {
        sql,
        params: [
            {column: 'from_date', type: TYPES.VarChar, value: dateRange[0]},
            {column: 'to_date', type: TYPES.VarChar, value: dateRange[1]}
        ]
    };
}

function getAddressSqlWithParams(obj) {

    const addressTerms = utils.cleanAddressSearch(obj.userInput.address);

    let sql = `PRISON_NUMBER IN (SELECT DISTINCT PRISON_NUMBER FROM HPA.ADDRESS_LOOKUP WHERE CONTAINS(ADDRESS_TEXT, 'NEAR((${addressTerms}), ${distance}, TRUE)'))`;
    return {
        sql,
        params: []
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
