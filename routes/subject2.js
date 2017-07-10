const {getSubject} = require('../controllers/subjectController2');
const express = require('express');
const {administrators} = require('../server/config');

// eslint-disable-next-line
let router = express.Router();

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.use(function(req, res, next) {
    if (!administrators.includes(req.user.email)) {
        return res.redirect('/search');
    }
    next();
});

router.get('/', (req, res) => res.redirect('/search'));
router.get('/:id/:page', getSubject);
router.get('/:id', (req, res) => res.redirect('/subject2/' + req.params.id + '/summary'));

module.exports = router;
