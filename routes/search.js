'use strict';
let express = require('express');

const {
    getIndex,
    postIndex,
    getSearchForm,
    postSearchForm,
    getResults
} = require('../controllers/searchController');

// eslint-disable-next-line
let router = express.Router();

router.use(function(req, res, next) {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

router.get('/', getIndex);
router.post('/', postIndex);
router.get('/form', getSearchForm);
router.post('/form', postSearchForm);
router.get('/results', getResults);

router.post('/results', (req, res) => {
    const validatedPage = getValidatedPage(req.body.pageNumber, req.session.rowCount);

    const redirectUrl = url.format({'pathname': '/search/results', 'query': {page: validatedPage}});
    return res.redirect(redirectUrl);
});

function getValidatedPage(value, rowCount) {
    if (!value || !isNumeric(value) || value < 1) {
        return 1;
    }

    if (rowCount && value > rowCount) {
        return rowCount;
    }

    return value;
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

module.exports = router;
