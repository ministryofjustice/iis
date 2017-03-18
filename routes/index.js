'use strict';

let passport = require('passport');

let express = require('express');
let content = require('../data/content');
let config = require('../server/config');

let logger = require('winston');

let util = require('util');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res) {
    logger.info('Authenticated: ' + req.isAuthenticated());
    return res.redirect('/search');
});

router.get('/login', passport.authenticate('oauth2'));

router.get('/authentication', passport.authenticate('oauth2', {failureRedirect: '/unauthorised'}),
    function(req, res) {
        logger.info('authentication callback');
        logger.info('user: ' + util.inspect(req.user));
        logger.info('Authenticated: ' + req.isAuthenticated());

        return res.redirect('/search');
    }
);

router.get('/unauthorised', function(req, res, next) {
    console.info('unauthorised');
});


router.get('/change-password', function(req, res) {
    logger.info('Change password user: ' + req.user.email);
    logger.info('Change password link: ' + req.user.profileLink);
    res.redirect(req.user.profileLink);
});


router.get('/logout', function(req, res) {
    console.log('logging out');
    let logoutLink = req.user.logoutLink;
    req.logout();
    res.redirect(logoutLink);
});

module.exports = router;
