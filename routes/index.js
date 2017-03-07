var express = require('express');
var router = express.Router();
var content = require('../data/content')

router.get('/', function(req, res) {
    res.redirect('/search');
});

router.get('/change-password', function (req, res) {

    if(!req.session.logged_in){
        res.redirect('/login')
        return;
    }

    res.render('change-password',{nav: true, content: content.view.changepassword});
});


router.get('/logout', function(req, res) {
    req.session.logged_in = undefined;
    res.redirect("/login")
});


module.exports = router;
