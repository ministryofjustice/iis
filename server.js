var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var express = require('express');
var logger = require('morgan');
var path = require('path');

var index = require('./routes/index');
var login = require('./routes/login');
var search = require('./routes/search');
var subject = require('./routes/subject');


// Logger configuration
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
    //json: true
});

logger.level = 'info';


//  Express Configuration
var app = express();


// Session configuration
app.use(cookieSession({
  name: 'session',
  keys: [Math.round(Math.random() * 100000).toString()], //
  maxAge: 60 * 60 * 1000 // 60 minute
}));


// View Engine Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Server Configuration
app.set('port', process.env.PORT || 3000);


// Request Processing Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//  Static Resources Configuration
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')));
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')));
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')));


// GovUK Template Configuration
/* jshint ignore:start */
app.locals.asset_path = '/public/';
/* jshint ignore:end */


// Express Routing Configuration
app.use('/', index);
app.use('/login/', login);
app.use('/search/', search);
app.use('/subject/', subject);


// Redirect to login page
app.use(function(req, res, next) {
    if (!isLoggedIn(req) && req.path != "/login") {
        res.redirect("/login");
        return;
    }

    if(!req.session.user_input) {
        req.session.user_input = {};
    }

    res.locals.nav = true;

    next();
});


// Error Handler
app.use(function (req, res, next) {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(logErrors);
app.use(clientErrors);

function logErrors (err, req, res, next) {
    logger.error('Unhandled error: ' + err.stack);
    next(err);
}

function clientErrors (error, req, res, next) {
    res.locals.message = error.message;
    res.locals.error = error;

    res.status(error.status || 500);

    res.render('error');
}

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;

function isLoggedIn(req){
    return req.session.logged_in;
}
