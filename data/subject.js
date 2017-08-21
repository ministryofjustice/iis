const TYPES = require('tedious').TYPES;
const db = require('./dataAccess/iisData');
const logger = require('../log');

const dataAccessOptions = {
    summary: 'JSON_QUERY(PERSONAL_DETAILS) AS summary',
    addresses: 'JSON_QUERY(ADDRESSES) AS addresses',
    aliases: 'JSON_QUERY(ALIASES) AS aliases',
    courtHearings: 'JSON_QUERY(COURT_HEARINGS) AS courtHearings',
    hdcInfo: 'JSON_QUERY(HDC_INFO) AS hdcInfo',
    hdcRecall: 'JSON_QUERY(HDC_RECALL) AS hdcRecall',
    movements: 'JSON_QUERY(MOVEMENTS) AS movements',
    offences: 'JSON_QUERY(OFFENCES) AS offences',
    offencesInCustody: 'JSON_QUERY(ADJUDICATIONS) AS offencesInCustody',
    sentencing: 'JSON_QUERY(SENTENCING) AS sentencing',
    sentenceSummary: `  JSON_QUERY(CATEGORY) AS 'sentenceSummary.category', 
                        JSON_VALUE(MOVEMENTS, \'$[0].establishment\') AS 'sentenceSummary.establishment', 
                        JSON_QUERY(COURT_HEARINGS, \'$[0]\') AS 'sentenceSummary.courtHearing', 
                        JSON_QUERY(SENTENCING, \'$[0]\') AS 'sentenceSummary.effectiveSentence'`
};

exports.getSubject = function(prisonNumber, dataRequired = ['summary']) {

    const params = [
        {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    let sql = `SELECT ${getSelectString(dataRequired)}
               FROM HPA.PRISONER_DETAILS
               WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER
               FOR JSON PATH, WITHOUT_ARRAY_WRAPPER`;

    logger.debug('Subject info search', sql);

    return new Promise((resolve, reject) => {
        db.getCollection(sql, params, resolveJsonResponse(resolve), reject);
    });
};

exports.getSubjectsForComparison = function(prisonNumbers, dataRequired = ['summary', 'addresses', 'aliases']) {

    let sql = `SELECT ${getSelectString(dataRequired)}
               FROM HPA.PRISONER_DETAILS
               WHERE ${getWhereStringFor(prisonNumbers)}
               FOR JSON PATH`;

    logger.debug('Subject info search for comparison', sql);

    return new Promise((resolve, reject) => {
        db.getCollection(sql, getParametersFor(prisonNumbers), resolveJsonResponse(resolve), reject);
    });
};

const getSelectString = dataRequired => {
    return dataRequired.reduce((selectString, item) => {
        if (item === 'summary') {
            return selectString;
        }
        return selectString.concat(', ', dataAccessOptions[item]);
    }, dataAccessOptions['summary']);
};

const resolveJsonResponse = resolve => response => {
    const concatinatedResponse = response.map(valueOfJsonSegment).join('');

    resolve(JSON.parse(concatinatedResponse));
};

const valueOfJsonSegment = responseSegment => {
    return Object.keys(responseSegment).reduce((segmentString, segmentKey) => {
        if (segmentKey.includes('JSON')) {
            return segmentString.concat(responseSegment[segmentKey].value);
        }
        return segmentString;
    }, '');
};

function getWhereStringFor(prisonNumbers) {
    return prisonNumbers.reduce((sql, prisonNumber, index) => {
        const string = index === 0 ?
            `PK_PRISON_NUMBER = @PK_PRISON_NUMBER_${index}` :
            ` OR PK_PRISON_NUMBER = @PK_PRISON_NUMBER_${index}`;

        return sql.concat(string);

    }, '');
}

function getParametersFor(prisonNumbers) {
    return prisonNumbers.map((prisonNumber, index) => {
        return {column: `PK_PRISON_NUMBER_${index}`, type: TYPES.VarChar, value: prisonNumber};
    });
}
