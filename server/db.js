'use strict';

let util = require('util');
let logger = require('winston');

let fakeDBFactory;
let connection;


function addParams(params, request) {
    params.forEach(function(param) {
        request.addParameter(
            param.column,
            param.type,
            param.value);
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

        let config = require('./config');
        let Connection = require('tedious').Connection;

        connection = new Connection({
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

        return connection;
    },

    getTuple: function(sql, params, callback) {

        let connected = false;
        connection = this.connect();

        connection.on('connect', function(err) {
            if (err) {
                return finish(err);
            }

            connected = true;

            let Request = require('tedious').Request;
            let request = new Request(sql, function(err, rowCount) {
                if (err) {
                    return finish(err);
                }
                if (rowCount === 0) {
                    return finish(null, rowCount);
                }
            });

            if (params) {
                addParams(params, request);
            }

            request.on('row', function(columns) {
                return finish(null, columns);
            });

            logger.debug('Executing tuple request: ' + util.inspect(request));
            connection.execSql(request);
        });

        let that = this;

        function finish(err, result) {

            if (err) {
                logger.error('Error during tuple query: ' + err);
            }

            if (connected) {
                that.disconnect();
            }

            return callback(err, result);
        }
    },

    getCollection: function(sql, params, callback) {

        let connected = false;
        connection = this.connect();

        connection.on('connect', function(err) {
            if (err) {
                return finish(err);
            }

            connected = true;

            let Request = require('tedious').Request;
            let request = new Request(sql, function(err, rowCount, rows) {

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

        let that = this;

        function finish(err, result) {

            if (err) {
                logger.error('Error during collection query: ' + err);
            }

            if (connected) {
                that.disconnect();
            }

            return callback(err, result);
        }
    },

    disconnect: function() {

        if (fakeDBFactory) {
            return;
        }

        connection.close();
    }
};