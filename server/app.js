'use strict';

const logger = require('../log.js');
const expressWinston = require('express-winston');
const addRequestId = require('express-request-id')();
const moment = require('moment');

const authorisationMiddleware = require('../middleware/authorisationMiddleware');

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const path = require('path');

const passport = require('passport');
const Strategy = require('passport-oauth2').Strategy;

const helmet = require('helmet');
const csurf = require('csurf');
const compression = require('compression');

const index = require('../routes/index');
const disclaimer = require('../routes/disclaimer');
const admin = require('../routes/admin');

const search = require('../routes/search');
const subject = require('../routes/subject');
const print = require('../routes/print');
const comparison = require('../routes/comparison');

const content = require('../data/content.js');
const config = require('../server/config');
const generateOauthClientToken = require('../server/clientCredentials');
const healthcheck = require('../server/healthcheck');
const getUserDetails = require('../data/auth/authClient');

const version = moment.now().toString();
const production = process.env.NODE_ENV === 'production';
const testMode = process.env.NODE_ENV === 'test';

//  Express Configuration
const app = express();
app.set('json spaces', 2);


// Configure Express for running behind proxies
// https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', true);

// View Engine Configuration
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

// Server Configuration
app.set('port', process.env.PORT || 3000);

// HACK: Azure doesn't support X-Forwarded-Proto so we add it manually
// http://stackoverflow.com/a/18455265/173062
app.use(function(req, res, next) {
  if (req.headers['x-arr-ssl'] && !req.headers['x-forwarded-proto']) {
    req.headers['x-forwarded-proto'] = 'https';
  }
  return next();
});

// Secure code best practice - see:
// 1. https://expressjs.com/en/advanced/best-practice-security.html,
// 2. https://www.npmjs.com/package/helmet
app.use(helmet());

app.use(addRequestId);

app.use(cookieSession({
  name: 'session',
  keys: [config.sessionSecret],
  maxAge: 60 * 60 * 1000,
  secure: config.https,
  httpOnly: true,
  signed: true,
  overwrite: true,
  sameSite: 'lax'
}));

app.use(passport.initialize());

if (testMode) {
  logger.info('Authentication disabled - using default test user profile');
  app.use(dummyUserProfile);
} else {

  logger.info('Authentication enabled');
  enableSSO();
}

// Request Processing Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Resource Delivery Configuration
app.use(compression());

// Cachebusting version string
if (production) {
  // Version only changes on reboot
  app.locals.version = version;
} else {
  // Version changes every request
  app.use(function(req, res, next) {
    res.locals.version = moment.now().toString();
    return next();
  });
}

//  Static Resources Configuration
const cacheControl = {maxAge: config.staticResourceCacheDuration * 1000};

['../public',
  '../govuk_modules/govuk_template/assets',
  '../govuk_modules/govuk_frontend_toolkit'
].forEach(dir => {
  app.use('/public', express.static(path.join(__dirname, dir), cacheControl));
});

[
  '../govuk_modules/govuk_frontend_toolkit/images'
].forEach(dir => {
  app.use('/public/images/icons', express.static(path.join(__dirname, dir), cacheControl));
});

// GovUK Template Configuration
app.locals.asset_path = '/public/';

// Don't cache dynamic resources
app.use(helmet.noCache());

// CSRF protection
if (!testMode) {
  app.use(csurf());
}

// Request logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  dynamicMeta: function(req, res) {
    const meta = {
      userEmail: req.user ? req.user.email : null,
      requestId: req.id,
      sessionTag: req.user ? req.user.sessionTag : null
    };

    if (res._headers.location) {
      meta.res_header_location = res._headers.location;
    }

    return meta;
  },
  colorize: true,
  requestWhitelist: ['url', 'method', 'originalUrl', 'query', 'body']
}));

// Express Routing Configuration
app.get('/health', (req, res, next) => {
  healthcheck((err, result) => {
    if (err) {
      return next(err);
    }
    if (!result.healthy) {
      res.status(503);
    }

    res.json(result);
  });
});

app.use('/', index);
app.use('/disclaimer/', disclaimer);
if (!testMode) {
  app.use(authRequired);
  app.use(authorisationMiddleware);
  app.use(addTemplateVariables);
}
app.use('/search/', search);
app.use('/subject/', subject);
app.use('/print/', print);
app.use('/comparison/', comparison);

app.use('/admin/', admin);

// Error Handler
app.use(function(req, res, next) {
  const error = new Error('Not Found');
  error.status = 404;
  res.render('notfound', {nav: true, content: content.view.notfound});
});

app.use(logErrors);
app.use(renderErrors);

function logErrors(error, req, res, next) {
  logger.error('Unhandled error: ' + error.stack);
  next(error);
}

function renderErrors(error, req, res, next) {
  res.locals.error = error;
  res.locals.stack = production ? null : error.stack;
  res.locals.message = production ?
        'Something went wrong. The error has been logged. Please try again' : error.message;

  res.status(error.status || 500);

  res.render('error', {nav: true, content: content.view.error});
}

//  SSO utility methods
function authRequired(req, res, next) {
  if (!req.user) {
    logger.info('Authorisation required - redirecting to login');
    return res.redirect('/login');
  }
  if (!req.user.disclaimer) {
    logger.info('Disclaimer required - redirecting to disclaimer');
    return res.redirect('/disclaimer');
  }
  res.locals.nav = true;
  next();
}

function addTemplateVariables(req, res, next) {
  res.locals.profile = req.user;
  next();
}

function dummyUserProfile(req, res, next) {
  req.user = {
    id: 1,
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'Tester',
    profileLink: '/profile'
  };
  res.locals.profile = req.user;
  next();
}

function enableSSO() {
  const ssoConfig = config.sso;

  app.use(passport.session());

  const strategy = new Strategy({
    authorizationURL: ssoConfig.TOKEN_HOST + ssoConfig.AUTHORIZE_PATH,
    tokenURL: ssoConfig.TOKEN_HOST + ssoConfig.TOKEN_PATH,
    clientID: ssoConfig.CLIENT_ID,
    clientSecret: ssoConfig.CLIENT_SECRET,
    callbackURL: ssoConfig.CALLBACK_URL,
    proxy: true, // trust upstream proxy
    state: true,
    customHeaders: {Authorization: generateOauthClientToken()}
  },
  (token, refreshToken, params, profile, done) => {
    logger.info('Passport authentication invoked');
    getUserDetails(token)
        .then(function(userDetails) {
          logger.info('User authentication success');
          return done(null, userDetails);
        })
        .catch(function(err) {
          logger.error('Authentication failure:' + err);
          return done(err);
        });
  });

  passport.use(strategy);

  passport.serializeUser(function(user, done) {
    // Not used but required for Passport
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    // Not used but required for Passport
    done(null, user);
  });
}

module.exports = app;
