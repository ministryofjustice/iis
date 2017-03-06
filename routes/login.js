var express = require('express');
var router = express.Router();
var users = require('../data/users');
var content = require('../data/content');


router.get('/', function(req, res, next) {
    req.session.loggedIn = 0;
    res.render('login', {content: content.view.login});
});


router.post('/', function (req, res, next) {
    var loginId = req.body.loginId,
        pwd = req.body.pwd,
        msg = content.errMsg.LOGIN_ERROR;

    if(!loginId || !pwd) {
        res.status(400);
        res.render('login', { msg: msg, content: content.view.login });
    } else {
        users.checkUsernameAndPassword(loginId, pwd, function(err, ok) {
            if (err) {return res.render('login', {msg: String(err)});}

            if(ok === true){
                req.session.loggedIn = loginId;
                res.redirect('/search');
            } else {
                res.status(400);
                res.render('login', { msg: msg, content: content.view.login });
            }

        });
    }
});

module.exports = router;



