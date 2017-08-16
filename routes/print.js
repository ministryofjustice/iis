const express = require('express');

const {
    getPrintForm,
    postPrintForm,
    getPdf
} = require('../controllers/printController');

// eslint-disable-next-line
const router = express.Router();

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/:prisonNo', getPrintForm);
router.post('/:prisonNo', postPrintForm);
router.get('/:prisonNo/pdf', getPdf);

module.exports = router;
