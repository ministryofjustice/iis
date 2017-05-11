'use strict';

const util = require('util');
const logger = require('../log.js');

let fakeDBFactory;


function addParams(params, request) {
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
}

module.exports = {

    setFakeFactory: function(fakeFactory) {
        fakeDBFactory = fakeFactory;
    },

    connect: function() {
        if (fakeDBFactory) {
            logger.info('Using fake DB');
            return fakeDBFactory();
        }

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

    getTuple: function(sql, params, successCallback, errorCallback) {
        const promise = arguments.length === 4;
        let connected = false;
        const connection = this.connect();

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

        const that = this;

        function finish(err, result) {
            if (connected) {
                that.disconnect(connection);
            }

            if (err) {
                logger.error('Error during tuple query: ' + err);
                if (promise) {
                    return errorCallback(err);
                }
            }
            if (promise) {
                return successCallback(result.totalRows.value);
            }
            successCallback(err, result);
        }
    },

    getCollection: function(sql, params, successCallback, errorCallback) {
        const promise = arguments.length === 4;
        let connected = false;
        const connection = this.connect();

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

        const that = this;

        function finish(err, result) {
            if (connected) {
                that.disconnect(connection);
            }

            if (err) {
                logger.error('Error during collection query: ' + err);
                if (promise) {
                    return errorCallback(err);
                }

            }
            if (promise) {
                return successCallback(result);
            }
            successCallback(err, result);
        }
    },

    disconnect: function(connection) {

        if (fakeDBFactory) {
            return;
        }

        connection.close();
    }
};
