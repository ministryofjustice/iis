'use strict';

let express = require('express');
let content = require('../data/content');

let logger = require('winston');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('disclaimer', {content: content.view.disclaimer});
});


router.post('/', function(req, res, next) {

    if (!req.body.disclaimer) {
        logger.info('Disclaimer not accepted');
        res.status(400);

        let err = {
            title: content.errMsg.LOGIN_ERROR,
            items: [{disclaimer: 'You must confirm that you understand the disclaimer'}],
            desc: content.errMsg.LOGIN_ERROR_DISCLAIMER
        };

        res.render('disclaimer', {err: err, content: content.view.disclaimer});

    } else {
        logger.info('Disclaimer accepted - redirecting to search');
        req.user.disclaimer = 'true';
        res.redirect('/search');

    }
});

module.exports = router;

