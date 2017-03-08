'use strict';

let express = require('express');
let users = require('../data/users');
let content = require('../data/content');

let logger=require('winston');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res, next) {
    req.session.loggedIn = 0;
    res.render('login', {content: content.view.login});
});


router.post('/', function(req, res, next) {
    let loginId = req.body.loginId;
    let pwd = req.body.pwd;
    let msg = content.errMsg.LOGIN_ERROR;

    if (!loginId || !pwd) {
        logger.info('Missing login inputs');
        res.status(400);
        res.render('login', {msg: msg, content: content.view.login});
    } else {
        users.checkUsernameAndPassword(loginId, pwd, function(err, ok) {
            if (err) {
                logger.error('Error checking credentials: ' + err);
                return res.render('login', {msg: String(err), content: content.view.login});
            }

            if (ok === true) {
                logger.info('Successful log in as: ' + loginId);
                req.session.loggedIn = loginId;
                res.redirect('/search');
            } else {
                logger.info('Failed to log in as: ' + loginId);
                res.status(400);
                res.render('login', {msg: msg, content: content.view.login});
            }

        });
    }
});

module.exports = router;
