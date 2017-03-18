'use strict';

let logger = require('./log.js');

let bodyParser = require('body-parser');
let session = require('express-session');
let express = require('express');
let path = require('path');

let passport = require('passport');
let OAuth2Strategy = require('passport-oauth2').Strategy;
let request = require('request');

let https = require('https');
let fs = require('fs');

let index = require('./routes/index');
let search = require('./routes/search');
let subject = require('./routes/subject');

let content = require('./data/content.js');

let config = require('./server/config');


//  Express Configuration
let app = express();


// SSO configuration

let ssoConfig = config.sso;

let sessionConfig = {
    secret: ssoConfig.SESSION_SECRET
};

app.use(session(sessionConfig));

if (config.secure === 'true') {
    logger.info('Authentication enabled');
    enableSSO();
} else {
    logger.info('Authentication disabled - using default test user profile');
    app.use(function(req, res, next) {
        req.user = {
            'email': 'test@test.com',
            'first_name': 'Test',
            'last_name': 'Tester',
            'profileLink': '/profile',
            'logoutLink': '/logout'
        };
        next();
    });
}


// View Engine Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Server Configuration
app.set('port', process.env.PORT || 3000);


// Request Processing Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//  Static Resources Configuration
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')));
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')));


// GovUK Template Configuration
/* jshint ignore:start */
app.locals.asset_path = '/public/';
/* jshint ignore:end */


// Express Routing Configuration
app.use('/', index);

app.use(function authRequired(req, res, next) {
    if (!req.user) {
        logger.info('Authorisation required - redirecting to login');
        return res.redirect('/login');
    }
    res.locals.nav = true;
    next();
});

app.use(function addTemplateVariables(req, res, next) {
    res.locals.profile = req.user;
    next();
});

app.use('/search/', search);
app.use('/subject/', subject);


// Error Handler
app.use(function(req, res, next) {
    let error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(logErrors);
app.use(clientErrors);

function logErrors(error, req, res, next) {
    logger.error('Unhandled error: ' + error.stack);
    next(error);
}

function clientErrors(error, req, res, next) {
    res.locals.message = error.message;
    res.locals.error = error;

    res.status(error.status || 500);

    res.render('error', {nav: true, content: content.view.error});
}


//  Start server in HTTP or HTTPS mode

if (config.https === 'true') {
    let httpsOptions = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };

    https.createServer(httpsOptions, app).listen(3000);
    console.log('IIS server listening with HTTPS on port ' + app.get('port'));
} else {
    app.listen(app.get('port'), function() {
        console.log('IIS server listening on port ' + app.get('port'));
    });
}


//  SSO utility methods

function enableSSO() {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new OAuth2Strategy({
            authorizationURL: ssoConfig.TOKEN_HOST + ssoConfig.AUTHORIZE_PATH,
            tokenURL: ssoConfig.TOKEN_HOST + ssoConfig.TOKEN_PATH,
            clientID: ssoConfig.CLIENT_ID,
            clientSecret: ssoConfig.CLIENT_SECRET,
            callbackURL: ssoConfig.REDIRECT_URI
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
            email: userDetails.email,
            firstName: userDetails.first_name,
            lastName: userDetails.last_name,
            profileLink: userDetails.links.profile,
            logoutLink: userDetails.links.logout
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
