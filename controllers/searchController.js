const content = require('../data/content');
const logger = require('../log');
const url = require('url');
const dob = require('../data/dob');
const identifier = require('../data/identifier');
const names = require('../data/names');
const search = require('../data/search');
const utils = require('../data/utils');
const audit = require('../data/audit');
const resultsPerPage = require('../server/config').searchResultsPerPage;
const {
    objectKeysInArray,
    itemsInQueryString
} = require('./helpers/formHelpers');
const {
    getInputtedFilters,
    removeAllFilters
} = require('./helpers/filterHelpers');

const availableSearchOptions = exports.availableSearchOptions = {
    identifier: {
        fields: ['prisonNumber', 'pncNumber', 'croNumber'],
        validator: identifier.validate,
        nextView: 'names',
        hints: []
    },
    names: {
        fields: ['forename', 'forename2', 'surname'],
        validator: names.validate,
        nextView: 'dob',
        hints: ['wildcard']
    },
    dob: {
        fields: ['dobOrAge', 'dobDay', 'dobMonth', 'dobYear', 'age'],
        validator: dob.validate,
        nextView: 'results',
        hints: []
    }
};

exports.getIndex = function(req, res) {
    logger.debug('GET /search');

    return res.render('search', {
        content: content.view.search
    });
};

exports.postIndex = function(req, res) {

    logger.debug('POST /search');
    const userReturnedOptions = req.body.option;

    if (!userReturnedOptions || userReturnedOptions.length === 0) {

        logger.info('Search: No search option supplied', {userId: req.user.id});

        let _err = {
            title: content.errMsg.CANNOT_SUBMIT,
            desc: content.errMsg.NO_OPTION_SELECTED
        };

        res.render('search', {
            err: _err,
            content: content.view.search
        });
        return;
    }

    const selectedOptions = objectKeysInArray(availableSearchOptions, userReturnedOptions);

    const redirectUrl = url.format({'pathname': '/search/form', 'query': selectedOptions});
    return res.redirect(redirectUrl);
};

exports.getSearchForm = function(req, res) {
    const searchItems = itemsInQueryString(req.query);
    const anyUnsupportedItems = searchItems.some(item => !availableSearchOptions[item]);

    if (anyUnsupportedItems) {
        logger.warn('No such search option', {view: req.params.view});
        return res.redirect('/search');
    }

    const hints = flatten(searchItems.map(item => availableSearchOptions[item].hints));
    res.render('search/full-search', {
        content: content.view.search,
        searchItems,
        hints
    });
};

exports.postSearchForm = function(req, res) {

    const userInput = userInputFromSearchForm(req.body);
    const searchItems = itemsInQueryString(req.query).filter(item => availableSearchOptions[item]);

    if(!inputValidates(searchItems, userInput)) {
        // more useful handler to be written if necessary
        // should only occur for those with JS off
        logger.info('Server side input validation used');
        return res.redirect('/search');
    }

    // /search/results to be addressed when audit table is included
    req.session.visited = [];
    req.session.userInput = userInput;
    res.redirect('/search/results');
};

exports.getResults = function(req, res) {
    logger.info('GET /search/results');
    if (!req.headers.referer) {
        return res.redirect('/search');
    }

    const {filtersForQuery, filtersForView} = getInputtedFilters(req.query);

    req.session.userInput = removeAllFilters(req.session.userInput);
    req.session.userInput = filtersForQuery ?
        Object.assign({}, req.session.userInput, filtersForQuery) :
        Object.assign({}, req.session.userInput);

    let page = getCurrentPage(req.query);
    req.session.lastPage = page;
    const pageError = getPaginationErrors(req.query);

    audit.record('SEARCH', req.user.email, req.session.userInput);
    search.totalRowsForUserInput(req.session.userInput)
        .then(data => {
            const rowCount = data.totalRows.value;
            if (rowCount === 0) {
                return renderResultsPage(req, res, rowCount);
            }

            if (!isValidPage(page, rowCount)) {
                return redirectToReferer(req, res, page);
            }

            req.session.userInput.page = page;
            return search.inmate(req.session.userInput).then(data => {
                const dataWithVisited = addVisitedData(data, req.session);
                return renderResultsPage(req,
                                         res,
                                         rowCount,
                                         dataWithVisited,
                                         page,
                                         pageError,
                                         filtersForView);
            }).catch(error => {
                logger.error('Error during inmate search ', error.message);
                return showDbError(res);
            });
        })
        .catch(error => {
            logger.error('Error during number of rows search ', error.message);
            return showDbError(res);
    });

    function showDbError(res) {
        let _err = {
            title: content.errMsg.DB_ERROR,
            desc: content.errMsg.DB_ERROR_DESC
        };

        res.status(500);
        res.render('search', {
            err: _err,
            content: content.view.search
        });
    }
};

const userInputFromSearchForm = requestBody => {
    const getReturnedFields = composeFieldsForOptionReducer(requestBody);
    return Object.keys(availableSearchOptions).reduce(getReturnedFields, {});
};

const composeFieldsForOptionReducer = requestBody => (collatedData, option) => {
    const returnedFields = availableSearchOptions[option].fields.filter(field => requestBody[field]);

    returnedFields.forEach(field => collatedData[field] = requestBody[field].trim());
    return collatedData;
};

const inputValidates = (searchItems, userInput) => {
    return !searchItems.some(item => availableSearchOptions[item].validator(userInput, err => err));
};

const flatten = arr => Array.prototype.concat(...arr);

const deleteFromArray = (array, index) => array.slice(0, index).concat(array.slice(index+1));

exports.postPagination = function(req, res) {
    const query = Object.assign({}, req.query, {page: req.body.pageNumber});

    const redirectUrl = url.format({pathname: '/search/results', query});
    res.redirect(redirectUrl);
};

exports.postFilters = function(req, res) {
    const query = url.parse(req.get('referrer'), true).query;
    const acceptableFilters = ['Male', 'Female', 'HDC'];
    const [filterPressed] = acceptableFilters.filter(filter => filter === req.body.filter);

    query.filters = addOrRemoveFromQuery(query, 'filters', filterPressed);

    // Reset to page 1 because the filters may leave the current page number invalid
    query.page = '1';

    const redirectUrl = url.format({pathname: '/search/results', query});
    res.redirect(redirectUrl);
};

function addOrRemoveFromQuery(query, section, item) {
    if(!query[section]) return [item];

    if(typeof query[section] === 'string') query[section] = [query[section]];

    if(query[section].includes(item)) {
        const index = query[section].indexOf(item);
        return deleteFromArray(query[section], index);
    }

    return [...query[section], item];
}

const getPaginationErrors = query => {
    if (query.invalidPage) {
        return {
            title: 'Invalid selection',
            desc: `The page number ${query.invalidPage} does not exist`
        };
    }
    return null;
};

function redirectToReferer(req, res, attemptedPage) {
    const urlObj = url.parse(req.get('referrer'), true);
    urlObj.query.invalidPage = attemptedPage;

    return res.redirect(url.format({pathname: urlObj.pathname, query: urlObj.query}));
}

const isNumeric = value => /^\d+$/.test(value);

function isValidPage(page, rowCount) {
    return isNumeric(page) && page > 0 && !(rowCount > 0 && page > Math.ceil(rowCount / resultsPerPage));
}

function renderResultsPage(req, res, rowcount, data, page, error = null, filtersForView) {

    res.render('search/results', {
        content: {
            title: getPageTitle(rowcount)
        },
        view: req.params.v,
        pagination: (rowcount > resultsPerPage ) ? utils.pagination(rowcount, page) : null,
        data,
        err: error,
        filtersForView,
        queryStrings: getQueryStrings(req.url)
    });
}

function getQueryStrings(currentUrl) {
    const query = url.parse(currentUrl, true).query;
    const currentPage = query.page ? query.page : 1;

    return {
        nextPage: url.format({query: Object.assign({}, query, {page: Number(currentPage) + 1})}),
        thisPage: url.format({query}),
        prevPage: url.format({query: Object.assign({}, query, {page: Number(currentPage) - 1})})
    };
}

function getCurrentPage(query) {
    const page = query ? Number(query.page) : 1;
    return Number.isNaN(page) ? 1 : page;
}

function getPageTitle(rowcount) {

    let oResultsPageContent = content.view.results;

    if (rowcount === 0) {
        return oResultsPageContent.title_no_results;
    }

    let title = oResultsPageContent.title;
    if (rowcount > 1) {
        title += 's';
    }

    return title.replace('_x_', rowcount);
}

function addVisitedData(data, session) {
    if (!session.visited || session.visited.length === 0) {
        return data;
    }

    return data.map(inmate => {
        inmate.visited = session.visited.includes(inmate.prisonNumber);
        return inmate;
    });
}
