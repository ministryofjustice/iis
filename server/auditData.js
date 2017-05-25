const {
    connect,
    addParams
} = require('./db');
const Request = require('tedious').Request;

module.exports = {

    addRow: function(sql, params, successCallback, errorCallback) {
        const connection = connect();
        connection.on('connect', (err) => {
            if (err) {
                errorCallback(err);
            }

            const request = new Request(sql, (err, rows, searchId) => {
                if(err) {
                    return errorCallback(err);
                }
                return successCallback(searchId[0].id.value);
                connection.close();
            });

            if (params) {
                addParams(params, request);
            }

            connection.execSql(request);
        });
    }
};
