'use strict';
let express = require('express');

const {
    getIndex,
    postIndex,
    getSearchForm,
    postSearchForm,
    getResults,
    postPagination,
    postFilters,
    getEditSearch,
    postEditSearch
} = require('../controllers/searchController2');

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
router.post('/results', postPagination);
router.post('/results/filters', postFilters);
router.get('/edit', getEditSearch);
router.post('/edit', postEditSearch);

module.exports = router;
