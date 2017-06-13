const {
    connect,
    addParams
} = require('./db');
const Request = require('tedious').Request;

module.exports = {

    addRow: function(sql, params, successCallback, errorCallback) {
        const connection = connect();
        connection.on('connect', error => {
            if (error) {
                errorCallback(error);
            }

            const request = new Request(sql, (error, rows, searchId) => {
                if(error) {
                    return errorCallback(error);
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
