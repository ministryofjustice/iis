const TYPES = require('tedious').TYPES;
const db = require('../server/iisData');
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
    offencesInCustody: 'JSON_QUERY(OFFENCES_IN_CUSTODY) AS offencesInCustody',
    sentencing: 'JSON_QUERY(SENTENCING) AS sentencing',
    sentenceSummary: `  JSON_QUERY(CATEGORY) AS 'sentenceSummary.category', 
                        JSON_VALUE(MOVEMENTS, \'$[0].establishment\') AS 'sentenceSummary.establishment', 
                        JSON_QUERY(COURT_HEARINGS, \'$[0]\') AS 'sentenceSummary.courtHearing', 
                        JSON_QUERY(SENTENCING, \'$[0]\') AS 'sentenceSummary.effectiveSentence'`
};

exports.getSubject = function(prisonNumber, dataRequired = ['summary']) {

    logger.debug('Subject info search');
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
