'use strict';

const express = require('express');
const content = require('../data/content');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res, next) {
  if (req.user && req.user.disclaimer) {
    res.redirect('/search');
  } else if (req.user) {
    res.render('splash', {content: content.view.splash});
  } else {
    res.redirect('/login');
  }
});

module.exports = router;

