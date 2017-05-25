'use strict';

module.exports = {

    connect: function() {
        const config = require('./config');
        const Connection = require('tedious').Connection;

        return new Connection({
            userName: config.db.username,
            password: config.db.password,
            server: config.db.server,
            options: {
                encrypt: true,
                database: config.db.database,
                useColumnNames: true,
                rowCollectionOnRequestCompletion: true
            }
        });
    },

    addParams: function(params, request) {
        params.forEach(function(param) {
            let paramValue = param.value;

            if (isNaN(paramValue)) {
                paramValue = paramValue.toUpperCase();
            }

            request.addParameter(
                param.column,
                param.type,
                paramValue);
        });
    },

    disconnect: function(connection) {
        connection.close();
    }
};
