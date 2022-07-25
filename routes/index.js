'use strict';

const passport = require('passport');
const express = require('express');
const logger = require('../log.js');
const content = require('../data/content');
const config = require('../server/config');
const authSignInUrl = `${config.sso.TOKEN_HOST}/sign-in`;
const emailLink = `hpa-private-beta-feedback@digital.justice.gov.uk`;

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res) {
  logger.info('GET / - Authenticated: ' + req.isAuthenticated());
  if (req.user) {
    return res.redirect('/search');
  } else {
    return res.render('splash',
        {
          content: content.view.splash,
          authSignInUrl,
          emailLink
        });
  }
});


const oauth = passport.authenticate('oauth2', {
  callbackURL: '/authentication',
  failureRedirect: '/unauthorised'
});

router.get('/autherror', function(req, res) {
  res.status(401);
  return res.render('autherror', {content: {title: 'Authorisation Error'}});
});

router.get('/login', oauth);

router.get('/authentication', oauth,
    function(req, res) {
      logger.info('Authentication callback', {user: req.user, authenticated: req.isAuthenticated()});
      return res.redirect('/disclaimer');
    }
);

const authLogoutUrl = `${config.sso.TOKEN_HOST}${config.sso.SIGN_OUT_PATH}?client_id=${config.sso.CLIENT_ID}`;

router.get('/logout', function(req, res) {
  if (req.user) {
    logger.info('Logging out', {user: req.user.email});
    req.logout();
  }
  res.redirect(authLogoutUrl);
});

router.get('/feedback', function(req, res, next) {
  return res.render('feedback', {
    content: content.view.feedback,
    returnURL: req.get('referer')
  });
});

module.exports = router;
