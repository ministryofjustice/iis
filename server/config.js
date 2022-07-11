'use strict';

const production = process.env.NODE_ENV === 'production';
const oneDay = 24 * 60 * 60;

function get(name, fallback, options = {}) {
  if (process.env[name]) {
    return process.env[name];
  }
  if (
    fallback !== undefined &&
        (!production || !options.requireInProduction)
  ) {
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

  sessionSecret: get('SESSION_SECRET', 'iis-insecure-default-session', {
    requireInProduction: true
  }),

  sso: {
    CLIENT_ID: get('CLIENT_ID', 'hpa-client'),
    CLIENT_SECRET: get('CLIENT_SECRET', 'clientsecret'),
    TOKEN_HOST: get('TOKEN_HOST', 'http://localhost:8080/auth'),
    AUTHORIZE_PATH: get('AUTHORIZE_PATH', '/oauth/authorize'),
    TOKEN_PATH: get('TOKEN_PATH', '/oauth/token'),
    CALLBACK_URL: get('CALLBACK_URL', 'http://localhost:3000/authentication'),
    USER_DETAILS_PATH: get('USER_DETAILS_PATH', '/api/user/me'),
    USER_PROFILE_PATH: get('USER_PROFILE_PATH', '/account-details'),
    SIGN_OUT_PATH: get('SIGN_OUT_PATH', '/sign-out'),
    SCOPES: get('CLIENT_SCOPES', 'read').replace(/ /g, '').split(',')
  },

  searchResultsPerPage: get('SEARCH_RESULTS_PER_PAGE', 10),

  administrators: get('ADMINISTRATORS', 'joe@example.com')
      .replace(/ /g, '')
      .split(','),

  addressSearchDistance: 5,

  features: {
    comparison: get('COMPARISON_ENABLED', true),
    addressSearch: get('ADDRESS_SEARCH_ENABLED', true)
  }
};
