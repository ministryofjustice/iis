var cookieSession = require('cookie-session')
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var api = require('./routes/api');
var login = require('./routes/login');
var search = require('./routes/search');

var app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['iiskey_1','iiskey_1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours 
}));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//app.get("/login");

app.use('/login/', login);
app.use('/search/', search);
app.use('/api/', api);


// redirect to login page
app.use(function(req, res) {
//    req.session.logged_in
    if (!isLoggedIn(req) && req.path != "/login") {
        res.redirect("/login")
    }
})


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