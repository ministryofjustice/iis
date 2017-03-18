'use strict';

function get(name, fallback) {
    if (process.env[name]) {
        return process.env[name];
    }
    if (fallback) {
        return fallback;
    }
    throw new Error('Missing env var ' + name);
}

module.exports = {
    db: {
        username: get('DB_USER', 'iis-admin@iis-sandbox'),
        password: get('DB_PASS', 'pass'),
        server: get('DB_SERVER', 'server'),
        database: get('DB_NAME', 'iis-sandbox')
    },

    sso: {
        AUTHENTICATION_ENABLED: true,
        SESSION_SECRET: 'iis-internal',
        CLIENT_ID: process.env.CLIENT_ID || '639803e6b176f8a727fedece7337eb64a066282d13b247854e76becaa0daa16e',
        CLIENT_SECRET: process.env.CLIENT_SECRET || '16eb41659e1b9f7ab2cc9fb256ca99772cdb62ee6176c9e789b301b37fb886d4',
        //TOKEN_HOST: process.env.TOKEN_HOST || 'https://www.signon.dsd.io',
        TOKEN_HOST: process.env.TOKEN_HOST || 'http://localhost:3001',
        TOKEN_PATH: process.env.TOKEN_PATH || '/oauth/token',
        AUTHORIZE_PATH: process.env.AUTHORIZE_PATH || '/oauth/authorize',
        REDIRECT_URI: process.env.REDIRECT_URI || 'http://localhost:3000/authentication',
        // REDIRECT_URI: process.env.REDIRECT_URI || 'https://hoa-iis.azurewebsites.net/authentication',
        USER_DETAILS_PATH: process.env.USER_DETAILS_PATH || '/api/user_details',
        LOGOUT_PATH: process.env.LOGOUT_PATH || '/users/sign_out'
    }
};
