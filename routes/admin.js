'use strict';
let express = require('express');
const {administrators} = require('../server/config');

const {
    getIndex
} = require('../controllers/adminController');

// eslint-disable-next-line
let router = express.Router();

router.use(function(req, res, next) {
    if (!administrators.includes(req.user.email)) {
        return res.redirect('/search');
    }
    next();
});

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/', getIndex);

module.exports = router;
