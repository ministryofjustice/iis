'use strict';
let express = require('express');

const {
    getIndex,
    getResults,
    postPagination,
    postFilters,
    postSearchForm,
	getSuggestions,
    getSuggestion,
    getNomis,
    getNomisResults
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
router.get('/results', getResults);
router.post('/results', postPagination);
router.post('/results/filters', postFilters);
router.post('/results/search', postSearchForm);
router.get('/suggestions', getSuggestions);
router.get('/suggestion', getSuggestion);
router.get('/nomis', getNomis);
router.get('/nomis/results', getNomisResults);

module.exports = router;
