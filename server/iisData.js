const {
    connect,
    addParams,
    disconnect
} = require('./db');
const util = require('util');
const logger = require('../log.js');

module.exports = {

    getTuple: function(sql, params, successCallback, errorCallback) {
        let connected = false;
        const connection = connect();

        connection.on('debug', function(err) {
            logger.debug('debug:', err);
        });

        connection.on('connect', function(err) {
            if (err) {
                return finish(err);
            }

            connected = true;

            const Request = require('tedious').Request;
            let request = new Request(sql, function(err, rowCount, rows) {

                if (err) {
                    return finish(err);
                }
                if (rowCount === 0) {
                    return finish(null, rowCount);
                }
                return finish(null, rows[0]);
            });

            if (params) {
                addParams(params, request);
            }

            logger.debug('Executing tuple request: ' + util.inspect(request));
            connection.execSql(request);
        });


        function finish(err, result) {
            if (connected) {
                disconnect(connection);
            }

            if (err) {
                logger.error('Error during tuple query: ' + err);
                return errorCallback(err);
            }
            return successCallback(result);
        }
    },

    getCollection: function(sql, params, successCallback, errorCallback) {
        let connected = false;
        const connection = connect();

        connection.on('connect', function(err) {
            if (err) {
                return finish(err);
            }

            connected = true;

            const Request = require('tedious').Request;
            const request = new Request(sql, function(err, rowCount, rows) {

                if (err) {
                    return finish(err);
                }
                if (rowCount === 0) {
                    return finish(null, rowCount);
                }

                return finish(null, rows);
            });

            if (params) {
                addParams(params, request);
            }

            logger.debug('Executing collection request: ' + util.inspect(request));
            connection.execSql(request);
        });

        function finish(err, result) {
            if (connected) {
                disconnect(connection);
            }

            if (err) {
                logger.error('Error during collection query: ' + err);
                return errorCallback(err);
            }
            return successCallback(result);
        }
    }
};
