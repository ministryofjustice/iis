var cookieSession = require('cookie-session')
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var api = require('./routes/api');
var login = require('./routes/login');
var search = require('./routes/search');

var app = express();

app.use(cookieSession({
  name: 'session',
  keys: [Math.round(Math.random() * 100000).toString()], //
  maxAge: 60 * 60 * 1000 // 60 minute 
}));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public',express.static(path.join(__dirname, 'public')));

app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_template/assets')))
app.use('/public', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit')))
app.use('/public/images/icons', express.static(path.join(__dirname, '/govuk_modules/govuk_frontend_toolkit/images')))

// Elements refers to icon folder instead of images folder
//app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images', 'favicon.ico')))

app.use('/', index);
app.use('/login/', login);

// redirect to login page
app.use(function(req, res, next) {
    if (!isLoggedIn(req) && req.path != "/login") {
        res.redirect("/login")
        return;
    }
    
    if(!req.session.user_input) 
        req.session.user_input = {};
    
    res.locals.nav = true;
    
    next();
})

app.use('/search/', search);
app.use('/api/', api);





// catch 404 and forward to error handler
app.use(function(req, res, next) {    
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.warn(err);
    
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;


function isLoggedIn(req){
    return req.session.logged_in;
}
