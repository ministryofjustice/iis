'use strict';

let util = require('util');

let logger = require('../log.js');
let expressWinston = require('express-winston');
let addRequestId = require('express-request-id')();
let uuidV1 = require('uuid/v1');
let moment = require('moment');

let bodyParser = require('body-parser');
let cookieSession = require('cookie-session');
let express = require('express');
let path = require('path');

let passport = require('passport');
let OAuth2Strategy = require('passport-oauth2').Strategy;
let request = require('request');

let helmet = require('helmet');
let csurf = require('csurf');
let compression = require('compression');

let index = require('../routes/index');
let disclaimer = require('../routes/disclaimer');
let search = require('../routes/search');
let subject = require('../routes/subject');

let content = require('../data/content.js');
let config = require('../server/config');

const version = moment.now().toString();
const production = process.env.NODE_ENV === 'production';

//  Express Configuration
let app = express();


// Configure Express for running behind proxies - https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', true);

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


// Automatically log every request with user details, a unique session id, and a unique request id
app.use(addRequestId);
function requestLogger() {
    return expressWinston.logger({
        winstonInstance: logger,
        meta: true,
        dynamicMeta: function(req, res) {
            let meta = {
                userId: req.user ? req.user.id : null,
                userEmail: req.user ? req.user.email : null,
                requestId: req.id,
                sessionTag: req.user ? req.user.sessionTag : null,
                req_header_referrer: req.header('referrer')
            };

            if(res._headers.location) {
                meta.res_header_location = res._headers.location;
            }

            return meta;
        },
        colorize: true,
        requestWhitelist: ['url', 'method', 'originalUrl', 'query', 'body']
    });
}

// SSO configuration
let testMode = process.env.NODE_ENV === 'test' ? 'true' : 'false';
let ssoConfig = config.sso;

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


if (testMode === 'true') {
    logger.info('Authentication disabled - using default test user profile');
    app.use(dummyUserProfile);
} else {
    logger.info('Authentication enabled');
    enableSSO();
}


// View Engine Configuration
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');


// Server Configuration
app.set('port', process.env.PORT || 3000);


// Request Processing Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// Resource Delivery Configuration
app.use(compression());

if (production) {
    app.locals.version = version;
} else {
    app.use(function(req, res, next) {
        res.locals.version = moment.now().toString();
        return next();
    });
}


//  Static Resources Configuration
let cacheControl = {maxAge: config.staticResourceCacheDuration * 1000};

let publicResourcePaths = [
    '../public',
    '../govuk_modules/govuk_template/assets',
    '../govuk_modules/govuk_frontend_toolkit'
];

let iconResourcePaths = [
    '../govuk_modules/govuk_frontend_toolkit/images'
];

publicResourcePaths.forEach((dir) => {
    app.use('/public', express.static(path.join(__dirname, dir), cacheControl));
});

iconResourcePaths.forEach((dir) => {
    app.use('/public/images/icons', express.static(path.join(__dirname, dir), cacheControl));
});

// GovUK Template Configuration
/* jshint ignore:start */
app.locals.asset_path = '/public/';
/* jshint ignore:end */

// Don't cache dynamic resources
app.use(helmet.noCache());

// CSRF protection
if (testMode !== 'true') {
    app.use(csurf());
}

// Express Routing Configuration
app.use(requestLogger());
app.use('/', index);
app.use('/disclaimer/', disclaimer);
if (testMode !== 'true') {
    app.use(authRequired);
    app.use(addTemplateVariables);
}
app.use('/search/', search);
app.use('/subject/', subject);


// Error Handler
app.use(function(req, res, next) {
    let error = new Error('Not Found');
    error.status = 404;
    res.render('notfound', {nav: true, content: content.view.notfound});
});

app.use(logErrors);
app.use(clientErrors);

function logErrors(error, req, res, next) {
    logger.error('Unhandled error: ' + error.stack);
    next(error);
}

function clientErrors(error, req, res, next) {
    res.locals.error = error;
    res.locals.stack = production ? null : error.stack;
    res.locals.message = production ? 'Something went wrong. The error has been logged. Please try again' : error.message;

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
        'email': 'test@test.com',
        'firstName': 'Test',
        'lastName': 'Tester',
        'profileLink': '/profile',
        'logoutLink': '/logout'
    };
    res.locals.profile = req.user;
    next();
}

function enableSSO() {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new OAuth2Strategy({
            authorizationURL: ssoConfig.TOKEN_HOST + ssoConfig.AUTHORIZE_PATH,
            tokenURL: ssoConfig.TOKEN_HOST + ssoConfig.TOKEN_PATH,
            clientID: ssoConfig.CLIENT_ID,
            clientSecret: ssoConfig.CLIENT_SECRET,
            proxy: true // trust upstream proxy
        },
        function(accessToken, refreshToken, profile, cb) {
            logger.info('Passport authentication invoked');

            let options = {
                uri: ssoConfig.TOKEN_HOST + ssoConfig.USER_DETAILS_PATH,
                qs: {access_token: accessToken},
                json: true
            };
            request(options, function(error, response, userDetails) {
                if (!error && response.statusCode === 200) {
                    logger.info('User authentication success');
                    return cb(null, userFor(userDetails));
                } else {
                    logger.error('Authentication failure:' + error);
                    return cb(error);
                }
            });
        })
    );

    function userFor(userDetails) {
        return {
            id: userDetails.id,
            email: userDetails.email,
            firstName: userDetails.first_name,
            lastName: userDetails.last_name,
            profileLink: userDetails.links.profile,
            logoutLink: userDetails.links.logout,
            sessionTag: uuidV1()
        };
    }


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
