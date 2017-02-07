var express = require('express');
var router = express.Router();

var users = require("../data/users");


router.get('/', function(req, res, next) {
    req.session.logged_in = 0;
    var msg = '';
    if(req.query.r && req.query.r == 'fail' )
        msg = 'Unable to sign in, try again';

    res.render('login', { msg: msg });
});


router.post('/', function (req, res, next) {    
    var login_id = req.body.login_id,
        pwd = req.body.pwd,
        msg = 'Unable to sign in, try again';
        
    if(!login_id || !pwd) {
        res.status(400);
        res.render('login', { msg: msg });
    } else {
        users.checkUsernameAndPassword(login_id, pwd, function(err, ok) {
            if (err) return res.render("login", {msg: String(err)});
            
            if(ok === true){ 
                req.session.logged_in = login_id;
                res.redirect('/search');
            } else {
                res.status(400);
                res.render('login', { msg: msg });
            }

        });        
    }
});

//hellos


module.exports = router;



