'use strict';

let express = require('express');
let content = require('../data/content.js');
let subject = require('../data/subject.js');
let utils = require('../data/utils.js');
let audit = require('../data/audit');

let logger = require('winston');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res) {
    res.redirect('/search');
});

router.get('/:id', function(req, res) {

    audit.record('VIEW', req.user.email, {prisonNumber: req.params.id});

    subject.details(req.params.id, function(err, data) {

        if (err) {
            logger.error('Error getting subject details: ' + err);
            res.render('subject', {
                title: content.errMsg.INVALID_ID,
                err: {
                    title: content.errMsg.INVALID_ID
                }
            });
        }

        let dob = data.DOB.value;

        if(dob) {
            data.AGE = utils.getAgeFromDOB(dob.split('/').reverse().join('-'));
        }

        res.render('subject', {
            subject: data,
            content: content.view.subject
        });
    });
});

module.exports = router;
