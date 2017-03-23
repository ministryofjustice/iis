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
        username: get('DB_USER', 'user'),
        password: get('DB_PASS', 'pass'),
        server: get('DB_SERVER', 'server'),
        database: get('DB_NAME', 'iis-sandbox')
    },

    https: get('HTTPS', 'false'),

    sso: {
        SESSION_SECRET: 'iis-internal',
        CLIENT_ID: get('CLIENT_ID', '123'),
        CLIENT_SECRET: get('CLIENT_SECRET', '123'),
        REDIRECT_URI: get('REDIRECT_URI', 'http://localhost:3000/authentication/'),
        TOKEN_HOST: get('TOKEN_HOST', 'http://localhost:3001'),
        AUTHORIZE_PATH: get('AUTHORIZE_PATH', '/oauth/authorize'),
        TOKEN_PATH: get('TOKEN_PATH', '/oauth/token'),
        USER_DETAILS_PATH: get('USER_DETAILS_PATH', '/api/user_details')
    }

};
