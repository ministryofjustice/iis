'use strict';

const express = require('express');
const content = require('../data/content');
const config = require('../server/config');
const authSignInUrl = `${config.sso.TOKEN_HOST}/sign-in`;
const emailLink = `hpa-private-beta-feedback@digital.justice.gov.uk`;

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res, next) {
  if (req.user && req.user.disclaimer) {
    res.redirect('/search');
  } else if (req.user) {
    res.render('splash',
        {
          content: content.view.splash,
          authSignInUrl,
          emailLink
        });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;

