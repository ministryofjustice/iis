'use strict';

let logger = require('./log.js');

let bodyParser = require('body-parser');
// let cookieSession = require('cookie-session');
let session = require('express-session');
let express = require('express');
let path = require('path');

let util = require('util');

let passport = require('passport');
let OAuth2Strategy = require('passport-oauth2').Strategy;
let request = require('request');

// let https = require('https');
// let http = require('http');
// let fs = require('fs');

let index = require('./routes/index');
let login = require('./routes/login');
let search = require('./routes/search');
let subject = require('./routes/subject');

let content = require('./data/content.js');

let config = require('./server/config');

// let httpsOptions = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// };

//  Express Configuration
let app = express();

const sessionConfig = {
    secret: 'iis-secret'
};

app.use(session(sessionConfig));

//SSO config
app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
        authorizationURL: 'http://localhost:3001/oauth/authorize',
        // authorizationURL: 'https://www.signon.dsd.io/oauth/authorize',
        tokenURL: 'http://localhost:3001/oauth/token',
        // tokenURL: 'https://www.signon.dsd.io/oauth/token',
        clientID: '639803e6b176f8a727fedece7337eb64a066282d13b247854e76becaa0daa16e',
        clientSecret: '16eb41659e1b9f7ab2cc9fb256ca99772cdb62ee6176c9e789b301b37fb886d4',
        callbackURL: 'http://localhost:3000/authentication'
    },
    function(accessToken, refreshToken, profile, cb) {
        logger.info('passport invoked');

        let options = {
            uri: 'http://localhost:3001/api/user_details',
            qs: {access_token: accessToken},
            json: true
        };
        request(options, function(error, response, userDetails) {
            if (!error && response.statusCode === 200) {

                let sessionUser = {
                    email: userDetails.email,
                    firstName: userDetails.first_name,
                    lastName: userDetails.last_name,
                    profileLink: userDetails.links.profile,
                    logoutLink: userDetails.links.logout
                };

                logger.info('Returning user');

                return cb(null, sessionUser);
            }
        });
    })
);


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});




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

app.use(function authRequired (req, res, next) {
    logger.info('check auth req');
    if (!req.user) {
        logger.info('redirecting - auth req');
        return res.redirect('/login');
    }
    res.locals.nav = true;
    next();
});

app.use(function addTemplateVariables (req, res, next) {
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

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

// https.createServer(httpsOptions, app).listen(3000);
// console.log('Express server listening on port ' + app.get('port'));

module.exports = app;
