const content = require('../data/content');
const logger = require('../log');
const dob = require('../data/dob');
const identifier = require('../data/identifier');
const names = require('../data/names');
const search = require('../data/search');
const utils = require('../data/utils');
const audit = require('../data/audit');
const resultsPerPage = require('../server/config').searchResultsPerPage;
const Case = require('case');

const {
    objectKeysInArray,
    itemsInQueryString
} = require('./helpers/formHelpers');
const {
    getInputtedFilters,
    removeAllFilters
} = require('./helpers/filterHelpers');
const {
    getQueryStringsForSearch,
    mergeIntoQuery,
    toggleFromQueryItem,
    getUrlAsObject,
    createUrl
} = require('./helpers/urlHelpers');

const availableSearchOptions = exports.availableSearchOptions = {
    identifier: {
        fields: ['prisonNumber', 'pncNumber', 'croNumber'],
        validator: identifier.validate,
        hints: []
    },
    names: {
        fields: ['forename', 'forename2', 'surname'],
        validator: names.validate,
        hints: ['wildcard']
    },
    dob: {
        fields: ['dobOrAge', 'dobDay', 'dobMonth', 'dobYear', 'age'],
        validator: dob.validate,
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

    return res.redirect(createUrl('/search/form', selectedOptions));
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

    if (!inputValidates(searchItems, userInput)) {
        logger.info('Server side input validation used');
        return res.redirect('/search');
    }

    req.session.visited = [];
    req.session.userInput = userInput;
    res.redirect('/search/results');
};

exports.getResults = function(req, res) {
    logger.info('GET /search/results');
    if (!req.headers.referer) {
        return res.redirect('/search');
    }

    req.session.userInput = addFiltersToUserInput(req.session.userInput, req.query);

    audit.record('SEARCH', req.user.email, req.session.userInput);

    search.totalRowsForUserInput(req.session.userInput)
        .then(returnedRows => getSearchResultsAndRender(req, res)(returnedRows))
        .catch(error => {
            logger.error('Error during number of rows search: ' + error);
            return renderErrorPage(res, error);
        });
};

function getSearchResultsAndRender(req, res) {

    const currentPage = getCurrentPage(req.query);
    req.session.userInput.page = currentPage;

    return function(rowCountData) {
        const rowCount = rowCountData.totalRows.value;
        if (rowCount === 0) {
            return res.render('search/results', parseResultsPageData(req, rowCount));
        }

        if (!isValidPage(currentPage, rowCount)) {
            return res.redirect(getReferrerUrlWithInvalidPage(req, currentPage));
        }

        return search.inmate(req.session.userInput).then(searchResult => {
            return res.render('search/results', parseResultsPageData(req, rowCount, searchResult, currentPage));
        }).catch(error => {
            logger.error('Error during inmate search ', {error: error});
            return renderErrorPage(res, error);
        });
    };
}

function parseResultsPageData(req, rowcount, data, page) {
    return {
        content: {
            title: getPageTitle(rowcount)
        },
        pagination: (rowcount > resultsPerPage ) ? utils.pagination(rowcount, page) : null,
        data: addSelectionVisitedData(data, req.session) || [],
        err: getPaginationErrors(req.query),
        filtersForView: getInputtedFilters(req.query, 'VIEW'),
        queryStrings: getQueryStringsForSearch(req.url),
        searchTerms: getSearchTermsForView(req.session.userInput)
    };
}

function renderErrorPage(res, error) {
    return res.render('search', {
        err: getDbErrorData(error),
        content: content.view.search
    });
}

function getDbErrorData(sourceError) {
    return {
        title: getMessageToDisplayFor(sourceError),
        desc: content.errMsg.DB_ERROR_DESC
    };
}

function getMessageToDisplayFor(sourceError) {

    let message = content.dbErrorCodeMessages[sourceError.code];
    if (message) return message;

    logger.error('content.dbErrorCodeMessages has no message for: ' + sourceError);
    return content.errMsg.DB_ERROR;
}

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

exports.postPagination = function(req, res) {
    const query = mergeIntoQuery(req.query, {page: req.body.pageNumber});

    res.redirect(createUrl('/search/results', query));
};

exports.postFilters = function(req, res) {
    const acceptableFilters = ['Male', 'Female', 'HDC'];
    const [filterPressed] = acceptableFilters.filter(filter => filter === req.body.filter);

    const newQueryObject = toggleFromQueryItem(req, 'filters', filterPressed, 'referrer');

    newQueryObject.page = '1';

    res.redirect(createUrl('/search/results', newQueryObject));
};

const getPaginationErrors = query => {
    if (query.invalidPage) {
        return {
            title: 'Invalid selection',
            desc: `The page number ${query.invalidPage} does not exist`
        };
    }
    return null;
};

function getReferrerUrlWithInvalidPage(req, attemptedPage) {
    const urlObj = getUrlAsObject(req.get('referrer'));
    urlObj.query.invalidPage = attemptedPage;

    return createUrl(urlObj.pathname, urlObj.query);
}

const isNumeric = value => /^\d+$/.test(value);

function isValidPage(page, rowCount) {
    return isNumeric(page) && page > 0 && !(rowCount > 0 && page > Math.ceil(rowCount / resultsPerPage));
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

function addSelectionVisitedData(data, session) {
    if (!session.visited || session.visited.length === 0) {
        return data;
    }

    return data.map(inmate => {
        inmate.visited = session.visited.includes(inmate.prisonNumber);
        return inmate;
    });
}

function addFiltersToUserInput(userInput, query) {
    const filtersForQuery = getInputtedFilters(query, 'QUERY');
    const cleanInput = removeAllFilters(userInput);

    if (!filtersForQuery) {
        return Object.assign({}, cleanInput);
    }
    return Object.assign({}, cleanInput, filtersForQuery);
}


function getSearchTermsForView(userInput) {

    let searchTerms = {};

    Object.keys(content.termDisplayNames).forEach(term => {
        if (userInput[term]) {
            searchTerms[content.termDisplayNames[term]] = userInput[term];
        }
    });

    if (userInput['dobOrAge'] === 'dob') {
        let dobParts = [userInput['dobDay'], userInput['dobMonth'], userInput['dobYear']];
        searchTerms[content.termDisplayNames['dob']] = dobParts.join('/');
    }

    return searchTerms;
}
