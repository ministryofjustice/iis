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

exports.getNomisResults = function(userInput) {
    return new Promise((resolve, reject) => {


        const token = 'token'  ;      // todo acquire token here? refresh it here?

        if (!token) {
            console.log('No NOMIS token');
            return reject({error: 'NOMIS token not set'});
        }

        const nomisQuery = translateQuery(userInput);

        if (isEmpty(nomisQuery)) {
            return resolve([]);
        }

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
                        return reject({error: 'NOMIS query access error'});
                    }

                    if (res.body) {
                        return resolve(translateResult(res.body));
                    }

                    return reject({error: 'NOMIS response error'});
                } catch (exception) {
                    logger.error('Exception querying NOMIS');
                    logger.error(exception);
                    return reject({error: 'NOMIS processing error'});
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
                        return reject({error: 'NOMIS token access error'});
                    }

                    if (res.body) {
                        return resolve(res.body.token);
                    }

                    return reject({error: 'NOMIS response error'});
                } catch (exception) {
                    logger.error('Exception getting NOMIS token');
                    logger.error(exception);
                    return reject({error: 'NOMIS processing error'});
                }
            });
    });
};

// Really?
function isEmpty(obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
