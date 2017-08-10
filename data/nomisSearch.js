'use strict';

const config = require('../server/config');
const logger = require('../log.js');

const superagent = require('superagent');
const url = require('url');

const {
    translateQuery
} = require('./nomis/queryTranslator');
const {
    translateResult
} = require('./nomis/resultTranslator');


const timeoutSpec = {
    response: config.nomis.timeout.response,
    deadline: config.nomis.timeout.deadline
};

const userSpec = {
    username: config.nomis.user,
    password: config.nomis.password
};

const loginUrl = url.resolve(`${config.nomis.apiUrl}`, 'api/users/login');
const queryUrl = url.resolve(`${config.nomis.apiUrl}`, 'api/v2/prisoners');

exports.getNomisResults = function(userInput, token) {
    return new Promise((resolve, reject) => {

        const nomisQuery = translateQuery(userInput);

        superagent
            .get(queryUrl)
            .query(nomisQuery)
            .set('Authorization', token)
            .set('Accept', 'application/json')
            .timeout(timeoutSpec)
            .end((error, res) => {
                try {
                    if (error) {
                        logger.error('Error querying NOMIS');
                        logger.error(error);
                        resolve(null);
                    }

                    if (res.body) {
                        resolve(translateResult(res.body));
                    }

                    reject(`Invalid response: ${res}`);
                } catch (exception) {
                    logger.error('Exception querying NOMIS');
                    logger.error(exception);
                    reject(exception);
                }
            });
    });
};

exports.getNomisToken = function() {
    return new Promise((resolve, reject) => {
        superagent
            .post(loginUrl)
            .set('content-type', 'application/json')
            .send(userSpec)
            .timeout(timeoutSpec)
            .end((error, res) => {
                try {
                    if (error) {
                        logger.error('Error getting NOMIS token');
                        logger.error(error);
                        resolve(null);
                    }

                    if (res.body) {
                        resolve(res.body.token);
                    }

                    reject(`Invalid response: ${res}`);
                } catch (exception) {
                    logger.error('Exception getting NOMIS token');
                    logger.error(exception);
                    reject(exception);
                }
            });
    });
};


// todo
// token expiry
// connection errors
// auth errors
// empty results
// results display
// document env vars
// stage env vars

