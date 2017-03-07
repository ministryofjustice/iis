'use strict';

let express = require('express');
let content = require('../data/content');

let logger=require('winston');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res) {
    res.redirect('/search');
});

router.get('/change-password', function(req, res) {
    res.render('change-password', {nav: true, content: content.view.changepassword});
});

router.get('/logout', function(req, res) {
    logger.info('Logging out: ' + req.session.loggedIn);
    req.session.loggedIn = undefined;
    res.redirect('/login');
});

module.exports = router;
