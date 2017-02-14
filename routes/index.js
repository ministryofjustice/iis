var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.redirect('/search');
});

router.get('/change-password', function (req, res) {

    if(!req.session.logged_in){
        res.redirect('/login')
        return;
    }

    res.render('change-password',{title: 'Change password', nav: true});
});


router.get('/logout', function(req, res) {
    req.session.logged_in = undefined;
    res.redirect("/login")
});


module.exports = router;
