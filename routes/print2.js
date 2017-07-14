const express = require('express');
const {administrators} = require('../server/config');

const {
    getPrintForm,
    postPrintForm,
    getPdf
} = require('../controllers/printController2');

// eslint-disable-next-line
const router = express.Router();

router.use(function(req, res, next) {
    if (!administrators.includes(req.user.email)) {
        return res.redirect('/print');
    }
    next();
});

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/', getPrintForm);
router.post('/', postPrintForm);
router.get('/pdf', getPdf);

module.exports = router;
