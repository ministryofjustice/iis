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
    url: get('TOKEN_HOST', 'http://localhost:8080/auth'),
    clientId: get('CLIENT_ID', 'hpa-client'),
    clientSecret: get('CLIENT_SECRET', 'clientsecret'),
    authorizePath: get('AUTHORIZE_PATH', '/oauth/authorize'),
    tokenPath: get('TOKEN_PATH', '/oauth/token'),
    callbackUrl: get('CALLBACK_URL', 'http://localhost:3000/authentication'),
    userProfilePath: get('USER_PROFILE_PATH', '/account-details'),
    timeout: Number(get('HMPPS_AUTH_TIMEOUT', 10000)),
    signOutPath: get('SIGN_OUT_PATH', '/sign-out'),
    scopes: get('CLIENT_SCOPES', 'read').replace(/ /g, '').split(',')
  },

  manageUsersApi: {
    url: get('MANAGE_USERS_API_HOST', 'http://localhost:9091')
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
