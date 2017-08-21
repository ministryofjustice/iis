const logger = require('../log');
const db = require('./dataAccess/auditData');
const TYPES = require('tedious').TYPES;
const {getCollection} = require('./dataAccess/iisData');
const utils = require('../data/utils');

const keys = ['LOG_IN', 'DISCLAIMER_ACCEPTED', 'SEARCH', 'VIEW', 'PRINT', 'SEARCH_NOMIS'];

exports.record = function record(key, user, data) {

    if(!keys.includes(key)) {
        throw new Error(`Unknown audit key: ${key}`);
    }

    logger.audit('AUDIT', {key});

    return addItem(key, user, data)
        .then(id => {
            logger.info('Audit item inserted', id);
        })
        .catch(error => {
            logger.error('Error during audit insertion ', error);
        });
};

function addItem(key, user, data) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO NON_IIS.Audit ([user], action, details)   
                     OUTPUT inserted.id  
                     VALUES (@user, @action, @details);`;

        const parameters = [
            {column: 'user', type: TYPES.VarChar, value: user},
            {column: 'action', type: TYPES.VarChar, value: key},
            {column: 'details', type: TYPES.VarChar, value: data ? JSON.stringify(data) : null}
        ];

        db.addRow(sql, parameters, resolve, reject);
    });
}

exports.getLatestActions = function() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT NON_IIS.Audit.[user], LastAction = Max(NON_IIS.Audit.timestamp)
                     FROM NON_IIS.Audit
                     GROUP BY NON_IIS.Audit.[user]
                     ORDER BY LastAction ASC`;

        const parameters = [];

        getCollection(sql, parameters, resolveLatestActionsData(resolve), reject);
    });
};

const resolveLatestActionsData = resolve => dbRows => {
    resolve(dbRows.map(row => {
        return{
            user: row.user.value ? row.user.value : 'Unknown',
            lastActionDate: row.LastAction.value ? utils.getFormattedDateFromString(row.LastAction.value) : 'Unknown'
        };
    }));
};
