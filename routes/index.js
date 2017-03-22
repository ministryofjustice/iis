'use strict';

let passport = require('passport');
let express = require('express');
let logger = require('winston');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res) {
    logger.info('GET / - Authenticated: ' + req.isAuthenticated());
    return res.redirect('/search');
});

router.get('/login', passport.authenticate('oauth2'));

router.get('/authentication', passport.authenticate('oauth2', {failureRedirect: '/unauthorised'}),
    function(req, res) {
        logger.info('Authentication callback', {user: req.user, authenticated: req.isAuthenticated()});
        return res.redirect('/disclaimer');
    }
);

router.get('/change-password', function(req, res) {
    if (req.user) {
        logger.info('Change password user: ' + req.user.email);
        logger.info('Change password link: ' + req.user.profileLink);
        res.redirect(req.user.profileLink);
    } else {
        res.redirect('/login');
    }
});


router.get('/logout', function(req, res) {
    if (req.user) {
        console.log('logging out');
        let profileLink = req.user.profileLink;
        req.logout();
        res.redirect(profileLink);
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
