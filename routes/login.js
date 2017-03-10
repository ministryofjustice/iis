'use strict';

let express = require('express');
let users = require('../data/users');
let content = require('../data/content');

let logger = require('winston');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res, next) {
    req.session.loggedIn = 0;
    res.render('login', {content: content.view.login});
});


router.post('/', function(req, res, next) {
    let loginId = req.body.loginId;
    let pwd = req.body.pwd;
    let err = {
        title: content.errMsg.LOGIN_ERROR,
        items: [{loginId: 'Enter user id and password again'}],
        desc: content.errMsg.LOGIN_ERROR_DESC
    };

    if (!loginId || !pwd || !req.body.disclaimer) {
        logger.info('Missing login inputs');
        res.status(400);
        //
        if (!req.body.disclaimer) {
            err.items.push({disclaimer: 'You must confirm that you understand the disclaimer'});
            err.desc += '. ' + content.errMsg.LOGIN_ERROR_DISCLAIMER;
        }

        res.render('login', {err: err, content: content.view.login});
    } else {
        users.checkUsernameAndPassword(loginId, pwd, function(oErr, ok) {

            if (oErr) {
                err = {
                    title: content.errMsg.DB_ERROR,
                    desc: content.errMsg.TRY_AGAIN
                };
                logger.error('Error checking credentials: ' + oErr);
                return res.render('login', {err: failedLoginErr, content: content.view.login});
            }

            if (ok === true) {
                logger.info('Successful log in as: ' + loginId);
                req.session.loggedIn = loginId;
                res.redirect('/search');
            } else {
                logger.info('Failed to log in as: ' + loginId);
                res.status(400);
                res.render('login', {err: err, content: content.view.login});
            }

        });
    }
});

module.exports = router;
