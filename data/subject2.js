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
    sentencing: 'JSON_QUERY(SENTENCING) AS sentencing'
};

exports.getSubject = function(prisonNumber, dataRequired = ['summary']) {

    logger.debug('Subject info search');
    const params = [
        {column: 'PK_PRISON_NUMBER', type: TYPES.VarChar, value: prisonNumber}
    ];

    let sql = `SELECT ${getSelectString(dataRequired)}
               FROM ( 
                       SELECT
                         row_number()
                         OVER ( PARTITION BY PRISON_NUMBER
                           ORDER BY (IS_ALIAS) ) ROW_NUM,
                         *
                       FROM HPA.PRISONERS
                       WHERE PRISON_NUMBER = @PK_PRISON_NUMBER
                     ) NUMBERED_ROWS
                WHERE ROW_NUM = 1
                ORDER BY IS_ALIAS, SURNAME, PRIMARY_INITIAL, BIRTH_DATE, RECEPTION_DATE DESC
                FOR JSON PATH`;

    logger.debug('Subject info search', sql);

    return new Promise((resolve, reject) => {
        db.getTuple(sql, params, resolveJsonResponse(resolve), reject);
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
    resolve(
        JSON.parse(
            Object.keys(response).reduce((totalResponse, key) => {
                return totalResponse.concat(response[key].value);
            }, '')
        )
    );
};
