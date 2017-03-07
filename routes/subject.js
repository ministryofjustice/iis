'use strict';

var express = require('express');
var router = express.Router();
var content = require('../data/content.js');
var subject = require('../data/subject.js');


router.get('/', function (req, res) {
    res.redirect('/search');
});

router.get('/:id', function (req, res) {

    subject.details(req.params.id, function (err, data) {

        if (err) {
            res.render('subject', {
                title: content.errMsg.INVALID_ID,
                err: {title: content.errMsg.INVALID_ID}
            });
        }

        res.render('subject', {subject: data, content: content.view.subject});
    });
});

module.exports = router;
