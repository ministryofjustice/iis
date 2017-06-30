'use strict';

const production = process.env.NODE_ENV === 'production';
const oneDay = 24 * 60 * 60;

function get(name, fallback, options = {}) {
    if (process.env[name]) {
        return process.env[name];
    }
    if (fallback !== undefined && (!production || !options.requireInProduction)) {
        return fallback;
    }
    throw new Error('Missing env var ' + name);
}

module.exports = {

    version: 0.1,

    db: {
        username: get('DB_USER', 'user'),
        password: get('DB_PASS', 'pass'),
        server: get('DB_SERVER', 'server'),
        database: get('DB_NAME', 'iis-sandbox')
    },

    https: production,
    staticResourceCacheDuration: 365 * oneDay,
    healthcheckInterval: Number(get('HEALTHCHECK_INTERVAL', 0)),

    sessionSecret: get('SESSION_SECRET', 'iis-insecure-default-session', {requireInProduction: true}),

    sso: {
        CLIENT_ID: get('CLIENT_ID', '123'),
        CLIENT_SECRET: get('CLIENT_SECRET', '123'),
        TOKEN_HOST: get('TOKEN_HOST', 'http://localhost:3001'),
        AUTHORIZE_PATH: get('AUTHORIZE_PATH', '/oauth/authorize'),
        TOKEN_PATH: get('TOKEN_PATH', '/oauth/token'),
        USER_DETAILS_PATH: get('USER_DETAILS_PATH', '/api/user_details')
    },

    searchResultsPerPage: get('SEARCH_RESULTS_PER_PAGE', 10)
};
